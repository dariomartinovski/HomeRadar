package com.home_radar.domain.events

import com.home_radar.domain.User
import org.springframework.context.ApplicationEvent

class UserCreatedEvent(val user: User) : ApplicationEvent(user)