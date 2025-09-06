package com.home_radar.domain.events

import com.home_radar.domain.Property
import org.springframework.context.ApplicationEvent

class PropertyCreatedEvent(val property: Property) : ApplicationEvent(property)