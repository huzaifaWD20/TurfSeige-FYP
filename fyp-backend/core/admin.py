from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('email', 'name', 'phone', 'position', 'skill_level', 'is_active', 'is_admin')
    list_filter = ('is_admin', 'is_active')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('name', 'phone', 'position', 'skill_level')}),
        ('Permissions', {'fields': ('is_active', 'is_admin', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'phone', 'position', 'skill_level', 'password1', 'password2', 'is_active', 'is_admin', 'is_staff', 'is_superuser'),
        }),
    )
    search_fields = ('email', 'name', 'phone')
    ordering = ('email',)

admin.site.register(User, CustomUserAdmin)
