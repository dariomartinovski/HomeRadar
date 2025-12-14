package com.home_radar.api

import com.home_radar.service.ImageService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@CrossOrigin
@RequestMapping("/api/images")
@RestController
class ImageController(
    private val imageService: ImageService
) {
    @GetMapping("/{id}")
    fun getImage(@PathVariable id: Long): ResponseEntity<ByteArray> {
        val image = imageService.findImageById(id) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok()
            .contentType(MediaType.IMAGE_PNG)
            .body(image)
    }
}