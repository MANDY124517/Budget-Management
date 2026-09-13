package com.smartbudget.service;

import com.smartbudget.dto.common.PagedResponse;
import com.smartbudget.dto.notification.NotificationDto;
import com.smartbudget.entity.Notification;
import com.smartbudget.entity.User;
import com.smartbudget.entity.enums.NotificationSeverity;
import com.smartbudget.exception.ResourceNotFoundException;
import com.smartbudget.repository.NotificationRepository;
import com.smartbudget.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationDto> getUserNotificationsPaged(Long userId, int page, int size) {
        Page<Notification> notificationPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return PagedResponse.<NotificationDto>builder()
                .content(notificationPage.getContent().stream().map(this::mapToDto).collect(Collectors.toList()))
                .page(notificationPage.getNumber())
                .size(notificationPage.getSize())
                .totalElements(notificationPage.getTotalElements())
                .totalPages(notificationPage.getTotalPages())
                .isLast(notificationPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Transactional
    public NotificationDto createNotification(
            Long userId, String title, String message, String type, NotificationSeverity severity, String metadata) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .notificationType(type)
                .severity(severity != null ? severity : NotificationSeverity.INFO)
                .isRead(false)
                .metadata(metadata)
                .build();

        Notification saved = notificationRepository.save(notification);
        return mapToDto(saved);
    }

    public NotificationDto mapToDto(Notification notification) {
        if (notification == null) return null;
        return NotificationDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .notificationType(notification.getNotificationType())
                .severity(notification.getSeverity())
                .isRead(notification.getIsRead())
                .metadata(notification.getMetadata())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
