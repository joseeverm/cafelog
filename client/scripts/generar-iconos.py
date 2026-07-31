#!/usr/bin/env python3
"""
Genera los íconos PWA de CaféLog en client/public/.

Dibuja la taza de café del logo (mismo trazo que el ícono `Coffee` de
lucide-react, en un lienzo de 24x24) sobre un fondo amber→marrón, para que los
íconos instalables coincidan con la identidad visual de la app.

Uso:
    python3 scripts/generar-iconos.py

Requiere Pillow (`pip install Pillow`). Los archivos generados se versionan en
el repo, así que este script solo hace falta si se quiere cambiar el diseño.
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw

PUBLIC = Path(__file__).resolve().parent.parent / "public"

# Paleta del tema claro (ver src/index.css)
AMBER = (245, 158, 11)      # amber-500 #f59e0b — theme_color
MARRON = (146, 64, 14)      # amber-800 #92400e — base del degradado
BLANCO = (255, 255, 255)

SS = 4  # supersampling: se dibuja a 4x y se reduce con LANCZOS


# ─────────────────────────── utilidades de trazo ───────────────────────────

def arco(cx: float, cy: float, r: float, a0: float, a1: float, pasos: int = 64):
    """Puntos de un arco, ángulos en grados (0° = derecha, sentido horario)."""
    return [
        (
            cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / pasos)),
            cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / pasos)),
        )
        for i in range(pasos + 1)
    ]


def densificar(puntos, paso: float = 0.35):
    """Interpola los segmentos para poder trazar con discos sin huecos."""
    salida = []
    for (x0, y0), (x1, y1) in zip(puntos, puntos[1:]):
        d = math.hypot(x1 - x0, y1 - y0)
        n = max(1, int(d / paso))
        for i in range(n):
            t = i / n
            salida.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t))
    salida.append(puntos[-1])
    return salida


def trazar(draw: ImageDraw.ImageDraw, puntos, grosor: float, color):
    """Traza una polilínea con extremos y uniones redondeados."""
    r = grosor / 2
    for x, y in densificar(puntos):
        draw.ellipse((x - r, y - r, x + r, y + r), fill=color)


# ─────────────────────────── el dibujo de la taza ───────────────────────────

def taza(draw: ImageDraw.ImageDraw, ox: float, oy: float, k: float, grosor: float):
    """Dibuja la taza en el espacio 24x24 de lucide, escalada por `k`."""
    def p(x: float, y: float):
        return (ox + x * k, oy + y * k)

    # Cuerpo: (3,8) → (17,8) → (17,17) ⌒ (13,21) → (7,21) ⌒ (3,17) → cierra
    cuerpo = (
        [p(3, 8), p(17, 8), p(17, 17)]
        + [p(x, y) for x, y in arco(13, 17, 4, 0, 90)]
        + [p(7, 21)]
        + [p(x, y) for x, y in arco(7, 17, 4, 90, 180)]
        + [p(3, 8)]
    )
    trazar(draw, cuerpo, grosor, BLANCO)

    # Asa: (17,8) → (18,8) ⌒ (18,16) → (17,16)
    asa = (
        [p(17, 8), p(18, 8)]
        + [p(x, y) for x, y in arco(18, 12, 4, -90, 90)]
        + [p(17, 16)]
    )
    trazar(draw, asa, grosor, BLANCO)

    # Vapor: tres líneas verticales
    for x in (6, 10, 14):
        trazar(draw, [p(x, 2), p(x, 4)], grosor, BLANCO)


def fondo(size: int, radio_frac: float) -> Image.Image:
    """Lienzo con degradado amber→marrón y esquinas redondeadas opcionales."""
    grad = Image.new("RGB", (1, size))
    for y in range(size):
        t = y / max(1, size - 1)
        grad.putpixel((0, y), tuple(round(a + (b - a) * t) for a, b in zip(AMBER, MARRON)))
    img = grad.resize((size, size), Image.Resampling.NEAREST).convert("RGBA")

    if radio_frac > 0:
        mascara = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mascara).rounded_rectangle(
            (0, 0, size - 1, size - 1), radius=round(size * radio_frac), fill=255
        )
        img.putalpha(mascara)
    return img


def icono(size: int, escala_contenido: float, radio_frac: float) -> Image.Image:
    """Un ícono completo: fondo + taza centrada ocupando `escala_contenido`."""
    s = size * SS
    img = fondo(s, radio_frac)
    draw = ImageDraw.Draw(img)

    lado = s * escala_contenido
    k = lado / 24
    trazar_grosor = 2 * k  # grosor 2 en el espacio 24x24, como lucide
    # La taza no llena el viewBox verticalmente (y ≈ 2..21): centrar ese rango.
    ox = (s - lado) / 2
    oy = (s - (21 - 2) * k) / 2 - 2 * k

    taza(draw, ox, oy, k, trazar_grosor)
    return img.resize((size, size), Image.Resampling.LANCZOS)


# ─────────────────────────────────── salida ───────────────────────────────────

def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)

    # Íconos normales: esquinas redondeadas como el favicon.svg (rx 7/32 ≈ 0.22)
    for size in (192, 512):
        ruta = PUBLIC / f"pwa-{size}x{size}.png"
        icono(size, 0.62, 0.22).save(ruta)
        print(f"✓ {ruta.name}")

    # Maskable: fondo a sangre y contenido dentro de la zona segura (80%)
    ruta = PUBLIC / "pwa-maskable-512x512.png"
    icono(512, 0.46, 0).save(ruta)
    print(f"✓ {ruta.name}")

    # apple-touch-icon: iOS aplica su propia máscara → cuadrado a sangre, sin alfa
    ruta = PUBLIC / "apple-touch-icon.png"
    icono(180, 0.60, 0).convert("RGB").save(ruta)
    print(f"✓ {ruta.name}")

    # favicon.ico multi-resolución
    ruta = PUBLIC / "favicon.ico"
    icono(256, 0.66, 0.22).save(
        ruta, sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    )
    print(f"✓ {ruta.name}")


if __name__ == "__main__":
    main()
