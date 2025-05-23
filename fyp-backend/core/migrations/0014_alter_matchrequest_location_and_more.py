# Generated by Django 5.0.14 on 2025-05-11 15:40

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0013_matchrequest_date_matchrequest_location_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='matchrequest',
            name='location',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='matchrequest',
            name='match_format',
            field=models.CharField(blank=True, choices=[('5v5', '5v5'), ('6v6', '6v6'), ('7v7', '7v7'), ('11v11', '11v11')], max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='matchrequest',
            name='target_team',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='received_match_requests', to='core.team'),
        ),
    ]
