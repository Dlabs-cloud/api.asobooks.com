import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ActivityLogEntity } from '../domain/entity/activity-log.entity';
import { ActivityLogEvent } from '../event/activity-log.event';

@EventsHandler(ActivityLogEvent)
export class ActivityLogEventHandler implements IEventHandler<ActivityLogEvent> {

  handle(event: ActivityLogEvent) {
    const associationActivity = new ActivityLogEntity();
    associationActivity.description = event.description;
    associationActivity.activityType = event.type;
    associationActivity.association = event.association;
    associationActivity.createdBy = event.portalUser;
    return associationActivity.save();
  }

}