package com.campusdrive.entity;

/**
 * Roles de usuario en la plataforma.
 * USER es el rol por defecto al registrarse.
 * Solo un ADMIN puede asignar SUBADMIN o ADMIN.
 */
public enum Role {
    USER,
    SUBADMIN,
    ADMIN
}
