package com.home_radar.repository

import com.home_radar.domain.enum.SubscriptionType
import org.springframework.stereotype.Repository


import com.home_radar.domain.PendingNotification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate
import java.time.LocalDateTime

@Repository
interface PendingNotificationRepository : JpaRepository<PendingNotification, Long> {

    @Query(
        """
        SELECT pn FROM PendingNotification pn
        WHERE pn.subscription.type = :type
          AND DATE(pn.createdAt) = :date
        """
    )
    fun findAllForTypeAndDate(
        @Param("type") type: SubscriptionType,
        @Param("date") date: LocalDate
    ): List<PendingNotification>

    @Query(
        """
        SELECT pn FROM PendingNotification pn
        WHERE pn.subscription.type = :type
          AND pn.createdAt >= :fromDate
        """
    )
    fun findAllForTypeAndAfterDate(
        @Param("type") type: SubscriptionType,
        @Param("fromDate") fromDate: LocalDateTime
    ): List<PendingNotification>
}