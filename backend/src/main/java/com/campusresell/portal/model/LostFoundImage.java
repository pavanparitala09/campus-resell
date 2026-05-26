package com.campusresell.portal.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lost_found_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LostFoundImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lost_found_item_id", nullable = false)
    @JsonIgnore
    private LostFoundItem lostFoundItem;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;
}
