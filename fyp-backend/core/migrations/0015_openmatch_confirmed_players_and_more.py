# Generated by Django 5.0.14 on 2025-05-11 17:41

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0014_alter_matchrequest_location_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='openmatch',
            name='confirmed_players',
            field=models.ManyToManyField(blank=True, related_name='confirmed_matches', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='openmatch',
            name='required_players',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
