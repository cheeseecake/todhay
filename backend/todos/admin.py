# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

# Register your models here.
from todos.models import Tag, Project, Todo, Wishlist
admin.site.register(Tag)
admin.site.register(Project)
admin.site.register(Todo)
admin.site.register(Wishlist)