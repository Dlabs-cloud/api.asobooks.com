import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ActivityLogEvent } from '../event/activity-log.event';
import { ActivityLog } from '../domain/entity/activity-log.entity';

@EventsHandler(ActivityLogEvent)
export class ActivityLogEventHandler implements IEventHandler<ActivityLogEvent> {

  handle(event: ActivityLogEvent) {
    const associationActivity = new ActivityLog();
    associationActivity.description = event.description;
    associationActivity.activityType = event.type;
    associationActivity.association = event.association;
    associationActivity.createdBy = event.portalUser;
    return associationActivity.save();
  }

}