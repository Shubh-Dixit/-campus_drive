package com.campusdrive.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador para la configuración de anuncios.
 * Permite activar/desactivar anuncios globalmente desde el backend.
 *
 * GET  /api/ads/config → { adsEnabled: true/false }
 * POST /api/ads/config → toggle (solo ADMIN)
 */
@RestController
@RequestMapping("/api/ads")
public class AdsController {

    // Controlado por variable de entorno: ADS_ENABLED=true/false
    // Por defecto los anuncios están habilitados en producción
    @Value("${ads.enabled:true}")
    private boolean adsEnabled;

    /**
     * Endpoint público — el frontend lo consulta para saber si mostrar anuncios.
     * No requiere autenticación para permitir la carga rápida.
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getAdConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("adsEnabled", adsEnabled);
        return ResponseEntity.ok(config);
    }

    /**
     * Endpoint protegido — solo ADMIN puede alternar el estado de los anuncios.
     * Ejemplo: POST /api/ads/config?enabled=false
     */
    @PostMapping("/config")
    public ResponseEntity<Map<String, Object>> toggleAds(
            @RequestParam(name = "enabled") boolean enabled) {
        this.adsEnabled = enabled;
        Map<String, Object> response = new HashMap<>();
        response.put("adsEnabled", adsEnabled);
        response.put("message", "Ad visibility updated to: " + enabled);
        return ResponseEntity.ok(response);
    }
}
