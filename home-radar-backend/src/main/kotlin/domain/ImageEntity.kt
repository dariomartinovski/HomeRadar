package com.home_radar.domain

import jakarta.persistence.*

@Entity
data class ImageEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,
    @Lob
    @Column(name = "image", nullable = false)
    var image: ByteArray,
)