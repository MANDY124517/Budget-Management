package com.smartbudget.dto.notification;

import com.smartbudget.entity.enums.NotificationSeverity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private String notificationType;
    private NotificationSeverity severity;
    private Boolean isRead;
    private String metadata;
    private Instant createdAt;
}
