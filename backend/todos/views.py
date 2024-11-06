from datetime import date
from dateutil.relativedelta import relativedelta
from rest_framework import viewsets
from rest_framework import generics
from todos.models import FREQUENCIES, Project, Tag, Todo, Wishlist
from todos.serializers import (ProjectSerializer, TagSerializer, TodoSerializer,
                               WishlistSerializer)

import json
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 20


@ensure_csrf_cookie
def set_csrf_token(request):
    """
    This will be `/api/set-csrf-cookie` on `urls.py`
    """
    return JsonResponse({"details": "CSRF cookie set"})


# @require_POST
# def LoginView(request):
#     data = json.loads(request.body)
#     username = data.get('username')
#     password = data.get('password')
#     if username is None or password is None:
#         return JsonResponse({
#             "errors": {
#                 "__all__": "Please enter both username and password"
#             }
#         }, status=400)
#     user = authenticate(username=username, password=password)
#     if user is not None:
#         login(request, user)
#         return JsonResponse({"username": username})
#     return JsonResponse(
#         {"error": "Invalid credentials"},
#         status=400,
#     )


# def LogoutView(request):
#     logout(request)
#     return JsonResponse({"detail": "Logged out"})


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
            queryset = queryset.filter(completed_date__isnull=True)
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
