# Generated by Django 5.0.14 on 2025-05-14 11:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0022_matchinvitation'),
    ]

    operations = [
        migrations.AddField(
            model_name='matchrequest',
            name='requesting_substitution_filled',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='matchrequest',
            name='requesting_substitution_slots',
            field=models.PositiveIntegerField(default=3),
        ),
        migrations.AddField(
            model_name='matchrequest',
            name='target_substitution_filled',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='matchrequest',
            name='target_substitution_slots',
            field=models.PositiveIntegerField(default=3),
        ),
        migrations.AlterField(
            model_name='matchrequest',
            name='requesting_confirmed_players',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='matchrequest',
            name='requesting_required_players',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='matchrequest',
            name='requesting_status',
            field=models.CharField(choices=[('incomplete', 'Incomplete'), ('complete', 'Complete'), ('full', 'Full')], default='incomplete', max_length=20),
        ),
        migrations.AlterField(
            model_name='matchrequest',
            name='target_confirmed_players',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='matchrequest',
            name='target_required_players',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='matchrequest',
            name='target_status',
            field=models.CharField(choices=[('incomplete', 'Incomplete'), ('complete', 'Complete'), ('full', 'Full')], default='incomplete', max_length=20),
        ),
    ]
