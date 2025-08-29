import type { ITimeService, TimeSlot, MeetingSelection, MeetingConfig } from '@/types';
import { MEETINGS_CONFIG } from '@/config/meetings';

export class TimeService implements ITimeService {
  private readonly currentDate: Date;

  constructor(currentDate: Date = new Date()) {
    this.currentDate = currentDate;
  }

  public async getCurrentMeeting(): Promise<MeetingSelection | null> {
    const activeMeeting = this.findActiveMeeting();
    
    if (activeMeeting) {
      return {
        config: activeMeeting,
        isActive: true,
      };
    }

    const nextMeeting = this.findNextMeeting();
    if (nextMeeting) {
      return {
        config: nextMeeting.config,
        isActive: false,
        nextStartTime: nextMeeting.nextStartTime,
      };
    }

    return null;
  }

  public isInTimeSlot(timeSlots: readonly TimeSlot[]): boolean {
    const now = this.currentDate;
    const dayOfWeek = now.getDay() as TimeSlot['dayOfWeek'];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return timeSlots.some(slot => {
      if (slot.dayOfWeek !== dayOfWeek) return false;

      const startMinute = slot.startMinute ?? 0;
      const endMinute = slot.endMinute ?? 59;
      
      const currentTotalMinutes = currentHour * 60 + currentMinute;
      const startTotalMinutes = slot.startHour * 60 + startMinute;
      const endTotalMinutes = slot.endHour * 60 + endMinute;

      return currentTotalMinutes >= startTotalMinutes && 
             currentTotalMinutes <= endTotalMinutes;
    });
  }

  public getNextMeetingTime(timeSlots: readonly TimeSlot[]): Date | null {
    const now = this.currentDate;
    const currentDay = now.getDay() as TimeSlot['dayOfWeek'];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const upcomingSlots = timeSlots
      .map(slot => {
        let targetDate = new Date(now);
        
        let daysToAdd = slot.dayOfWeek - currentDay;
        if (daysToAdd < 0 || 
            (daysToAdd === 0 && 
             (slot.startHour < currentHour || 
              (slot.startHour === currentHour && (slot.startMinute ?? 0) <= currentMinute)))) {
          daysToAdd += 7;
        }

        targetDate.setDate(targetDate.getDate() + daysToAdd);
        targetDate.setHours(slot.startHour, slot.startMinute ?? 0, 0, 0);
        
        return targetDate;
      })
      .filter(date => date > now)
      .sort((a, b) => a.getTime() - b.getTime());

    return upcomingSlots[0] || null;
  }

  private findActiveMeeting(): MeetingConfig | null {
    const prioritizedConfigs = [...MEETINGS_CONFIG]
      .sort((a, b) => this.getMeetingPriority(a) - this.getMeetingPriority(b));

    return prioritizedConfigs.find(config => 
      this.isInTimeSlot(config.schedule)
    ) || null;
  }

  private findNextMeeting(): { config: MeetingConfig; nextStartTime: Date } | null {
    const upcomingMeetings = MEETINGS_CONFIG
      .map(config => ({
        config,
        nextStartTime: this.getNextMeetingTime(config.schedule),
      }))
      .filter((meeting): meeting is { config: MeetingConfig; nextStartTime: Date } => 
        meeting.nextStartTime !== null
      )
      .sort((a, b) => a.nextStartTime.getTime() - b.nextStartTime.getTime());

    return upcomingMeetings[0] || null;
  }

  private getMeetingPriority(config: MeetingConfig): number {
    const priorityMap: Record<string, number> = {
      'friday-vibes': 1,
      'morning-energetic': 2,
      'afternoon-focus': 3,
      'default-calm': 4,
    };

    return priorityMap[config.id] || 999;
  }
}