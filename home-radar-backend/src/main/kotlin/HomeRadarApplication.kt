package com.home_radar

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@EnableScheduling
@SpringBootApplication
class HomeRadarApplication

fun main(args: Array<String>) {
    runApplication<HomeRadarApplication>(*args)
}