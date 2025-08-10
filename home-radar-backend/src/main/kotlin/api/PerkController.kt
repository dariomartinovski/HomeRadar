package com.home_radar.api

import com.home_radar.domain.Perk
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import com.home_radar.service.PerkService

@RestController
@RequestMapping("/api/perks")
class PerkController(
    val perkService: PerkService
) {
    @GetMapping
    fun findAllPerks(): List<Perk> = perkService.findAllPerks()

    @GetMapping("/test")
    fun test() = "Hello perks!"

}