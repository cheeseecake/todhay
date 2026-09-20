from datetime import date
from dateutil.relativedelta import relativedelta
from rest_framework import viewsets
from rest_framework.decorators import (api_view, permission_classes,
                                       throttle_classes)
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from todos.models import FREQUENCIES, Project, Tag, Todo, Wishlist
from todos.serializers import (ProjectSerializer, TagSerializer, TodoSerializer,
                               WishlistSerializer)

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 20


class LoginRateThrottle(AnonRateThrottle):
    scope = "login"


@ensure_csrf_cookie
def set_csrf_token(request):
    """
    Returns the CSRF token to the frontend. The frontend sends it back in the
    `X-Csrftoken` header for unsafe requests.
    """
    return JsonResponse({"details": "CSRF cookie set", "csrfToken": get_token(request)})


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def LoginView(request):
    username = request.data.get('username')
    password = request.data.get('password')
    if username is None or password is None:
        return Response({
            "errors": {
                "__all__": "Please enter both username and password"
            }
        }, status=400)
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        # Django rotates the CSRF token on login, so hand the new one back
        return Response({
            "username": user.username,
            "csrfToken": get_token(request),
        })
    return Response(
        {"error": "Invalid credentials"},
        status=400,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def LogoutView(request):
    logout(request)
    return Response({"detail": "Logged out"})


@api_view(["GET"])
@permission_classes([AllowAny])
def SessionView(request):
    """Lets the frontend know whether it has a valid session on page load."""
    if not request.user.is_authenticated:
        return Response({"detail": "Not authenticated"}, status=401)
    return Response({"username": request.user.username})


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    queryset = Tag.objects.all()


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()


class TodoViewSet(viewsets.ModelViewSet):
    serializer_class = TodoSerializer

    def get_queryset(self):
        queryset = Todo.objects.all()
        wip = self.request.query_params.get('wip')
        if wip:

            # Update overdue todos
            today = date.today()
            overdue_todos = queryset.filter(due_date__lt=today, completed_date__isnull=True)

            for todo in overdue_todos:
                if todo.due_date:
                    # Calculate days difference between due_date and today
                    days_diff = (today - todo.due_date).days

                    # Update start_date if it is the same as due_date
                    if todo.start_date and todo.start_date == todo.due_date:
                        todo.start_date = todo.start_date + relativedelta(days=days_diff)

                    # Update due_date
                    todo.due_date = todo.due_date + relativedelta(days=days_diff)
                    todo.save()

            # Return the updated queryset
            queryset = Todo.objects.filter(completed_date__isnull=True)

        return queryset

    def perform_update(self, serializer):
        # Issue: Function is not called when you create and complete a todo in one request.
        # Get the todo that is going to be updated
        original_todo = self.get_object()
        original_tags = Tag.objects.filter(todo=original_todo.id)
        # Perform the save at database level and get the updated object
        updated_todo = serializer.save()
        # Check if completed_date was set in this update
        original_completed_date = original_todo.completed_date
        updated_completed_date = updated_todo.completed_date
        was_todo_completed = bool(updated_completed_date) and not bool(
            original_completed_date)

        # Now, we decide whether to create a recurring todo

        # If completed_date wasn't toggled to have a value in this update,
        # don't create the recurring todo
        if not was_todo_completed:
            print("Todo was not completed")
            return

        # Check if task is recurring, using the value from the NEW todo
        # (in case the user decided not to have a recurring task)
        if updated_todo.frequency is None:
            print("Not a recurring todo")
            return
        # If end_date is set, and today is past the todo's end_date, don't create any more recurring todos
        # if new_todo.end_date and date.today() >= new_todo.end_date:
        #    print("No more todos as end date has past")
        #    return

        # Calculate the new due_date and start_date
        # better to have it based on original start date and due date over completed date
        relativedelta_to_add = FREQUENCIES[updated_todo.frequency]
        if updated_todo.frequency == "DAILY" :
            new_start_date = updated_completed_date + relativedelta_to_add
            new_due_date = new_start_date
        else:
            new_start_date = updated_todo.start_date + relativedelta_to_add
            new_due_date = updated_todo.due_date + \
                relativedelta_to_add if updated_todo.due_date else None

        # If end_date is set, and new_due_date is past the todo's end_date, don't create the recurring todo
        if updated_todo.end_date and new_due_date >= updated_todo.end_date:
            print("No more todos due beyond end_date")
            return

        # If the recurring in progress todo already exists, don't bother creating it
        # We compare the list, frequency, title and completed_date
        if Todo.objects.filter(project=updated_todo.project,
                               frequency=updated_todo.frequency,
                               title=updated_todo.title,
                               completed_date=None
                               ).exists():
            print("In progress todo already exists")
            return

        # All the checks have passed, now we create the todo
        print("Creating next todo")

        next_todo = Todo(
            title=original_todo.title,
            project=updated_todo.project,
            effort=updated_todo.effort,
            reward=updated_todo.reward,

            frequency=updated_todo.frequency,
            end_date=updated_todo.end_date,

            start_date=new_start_date,
            due_date=new_due_date,
        )
        next_todo.save()
        if original_tags:
            next_todo.tags.set(original_tags)


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    queryset = Wishlist.objects.all()
