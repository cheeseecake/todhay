import uuid
from datetime import date, timezone

from dateutil.relativedelta import relativedelta
from django.db import models

from django.core.exceptions import ValidationError
# Ordering of data is done client-side (https://stackoverflow.com/questions/43414603/array-sorting-in-front-end-or-back-end)

# Setting frequencies as constants allows us to reference them as models.FREQUENCIES
# Also, the value of the delta is set in one place
FREQUENCIES = {
    'DAILY': relativedelta(days=1),
    'WEEKLY': relativedelta(weeks=1),
    'MONTHLY': relativedelta(months=1),
    'QUARTERLY': relativedelta(months=3),
    'YEARLY': relativedelta(years=1)
}

class Tag(models.Model):
    """Can be set on Projects or Todos e.g. 'Learning', 'Social', 'Work', or any combination of them"""
    title = models.TextField()
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['title']

class Metadata(models.Model):
    """Common properties are grouped here"""

    # UUIDs have almost no probability of colliding, and thus avoids
    # id collision issues when the backend/frontend go out of sync
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    # I like TextFields cuz then I don't have to worry about limits and space is cheap
    title = models.TextField()
    description = models.TextField(blank=True)

    tags = models.ManyToManyField(Tag, blank=True)

    start_date = models.DateField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    completed_date = models.DateField(blank=True, null=True)

    class Meta:
        abstract = True  # Setting this will not create any table in the database
        ordering = ['-completed_date', 'due_date', 'start_date']

class Project(Metadata):
    """Lists can have any combination of recurring/non-recurring todos within them.
    When a list is saved, all children Todos are marked as completed"""
    # https://stackoverflow.com/questions/2529472/how-do-i-make-many-to-many-field-optional-in-django?rq=1

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # Don't update children todos if the list isn't marked as completed
        if not self.completed_date:
            return

        for todo in self.todo_set.all():
            if todo.completed_date:
                continue
            todo.completed_date = date.today()
            todo.save()


class Todo(Metadata):
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, blank=True, null=True)
    # type = models.CharField(max_length=20,
    #                              choices=(
    #                                  ('todo', 'todo'),
    #                                  ('project', 'project'),
    #                                  ('milestone', 'milestone')),
    #                              default='todo',
    #                              null=True,
    #                              blank=True)
    # If frequency is not None, this means the todo is recurring
    frequency = models.CharField(max_length=20,
                                 choices=(
                                     map(lambda x: (x, x), FREQUENCIES.keys())),
                                 default=None,
                                 null=True,
                                 blank=True)
    # I'm guessing this is the date after which the task should stop recurring
    # If end_date is None and frequency is set, the task recurs forever
    end_date = models.DateField(blank=True, null=True)

    effort = models.DecimalField(max_digits=6, decimal_places=2, default=0.5)
    reward = models.DecimalField(max_digits=6, decimal_places=2, default=0.5)

    def clean(self):
        # Don't update todo if completed_date is before start_date
        if self.completed_date and (self.completed_date < self.start_date):
            raise ValidationError('completed_date must be after start_date.')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Wishlist(models.Model):
    tags = models.ManyToManyField(Tag, blank=True)
    title = models.TextField()
    cost = models.DecimalField(default=0, max_digits=6, decimal_places=2)
    img_url = models.URLField(max_length=400, blank=True)
    product_url = models.URLField(max_length=400, blank=True)
    count = models.IntegerField(default=0, null=True)
    repeat = models.BooleanField(default=False)
    last_purchased_date = models.DateField(blank=True, null=True)
