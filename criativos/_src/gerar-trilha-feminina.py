"""Trilha original (livre de direitos), suave e elegante, para o Reels feminino de 20s.

Uso: python3 gerar-trilha-feminina.py saida.wav
Cortes do vídeo: 3.8s, 8.0s, 12.4s, 16.4s (ver video-reels-feminino.html).
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 44100
DUR = 20.0
N = int(SR * DUR)
rng = np.random.default_rng(11)
L = np.zeros(N)
R = np.zeros(N)

CUTS = [3.8, 8.0, 12.4, 16.4]
DROP = 3.8
BPM = 96
BEAT = 60 / BPM
END = 19.2


def env(n, a=0.005, d=0.3):
    t = np.arange(n) / SR
    return np.clip(t / a, 0, 1) * np.exp(-t / d)


def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * gain * (1 - pan) ** 0.5
    R[i:i + len(sig)] += sig * gain * (1 + pan) ** 0.5


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)


# ---------- instrumentos ----------
def epiano(f, length, vel=1.0):
    """Piano elétrico (FM suave)."""
    n = int(length * SR)
    t = np.arange(n) / SR
    idx = 1.2 * np.exp(-t / 0.25)
    tone = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
    tone += 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.4)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.5 * t)
    rel = np.clip((length - t) / 0.3, 0, 1)
    return tone * env(n, 0.004, 1.6) * trem * rel * 0.09 * vel


def bell(f, length=1.4):
    n = int(length * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * f * t + 1.8 * np.exp(-t / 0.15) * np.sin(2 * np.pi * 3.5 * f * t))
    return tone * env(n, 0.002, 0.45) * 0.07


def pad(freqs, length):
    n = int(length * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for d in (-0.004, 0.0, 0.004):
            s += np.sin(2 * np.pi * f * (1 + d) * t) + 0.3 * np.sin(2 * np.pi * 2 * f * (1 + d) * t)
    s /= len(freqs) * 3
    fade = np.clip(t / 0.6, 0, 1) * np.clip((length - t) / 0.6, 0, 1)
    return s * fade * 0.11


def kick():
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    f = 48 + 70 * np.exp(-t / 0.035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.16) * 0.75


def snap():
    n = int(0.2 * SR)
    x = hp(lp(rng.standard_normal(n), 6000), 1500)
    return x * env(n, 0.001, 0.045) * 0.22


def shaker():
    n = int(0.09 * SR)
    x = hp(rng.standard_normal(n), 6000, 4)
    t = np.arange(n) / SR
    e = np.clip(t / 0.02, 0, 1) * np.exp(-t / 0.03)
    return x * e * 0.07


def bass(f, length):
    n = int(length * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    rel = np.clip((length - t) / 0.05, 0, 1)
    return s * np.clip(t / 0.01, 0, 1) * np.exp(-t / 0.6) * rel * 0.3


def shimmer(length):
    """Subida suave (vento brilhante) para as transições."""
    n = int(length * SR)
    t = np.linspace(0, 1, n)
    x = lp(hp(rng.standard_normal(n), 3000), 9000)
    return x * t ** 2.5 * 0.05


# ---------- harmonia em Fá maior: Fmaj7 – Dm7 – Bbmaj7 – C ----------
CH = [
    (87.31, [174.61, 220.0, 261.63, 329.63]),   # Fmaj7
    (73.42, [146.83, 174.61, 220.0, 261.63]),   # Dm7
    (116.54, [233.08, 293.66, 349.23, 440.0]),  # Bbmaj7
    (130.81, [261.63, 329.63, 392.0, 466.16]),  # C7
]
SCALE = [698.46, 783.99, 880.0, 1046.5, 1174.66, 1318.5]  # F5 G5 A5 C6 D6 E6

# ---------- INTRO (0 – 3.8): só piano e sininhos ----------
for k, (root, ch) in enumerate([CH[0], CH[1]]):
    t0 = k * 1.9
    for j, f in enumerate(ch):
        add(epiano(f, 2.0, 0.9), t0 + j * 0.06, 1.0, -0.2 + 0.13 * j)
add(pad([174.61, 220.0, 261.63], 3.9), 0, 0.7)
for i, t0 in enumerate([0.3, 0.95, 1.65, 2.3, 2.9]):
    add(bell(SCALE[(i * 2) % len(SCALE)]), t0, 1.0, 0.4 if i % 2 else -0.4)
add(shimmer(1.0), DROP - 1.0, 1.0)

# ---------- CORPO (3.8 – fim): batida suave 96 BPM ----------
t = DROP
beat = 0
while t < END:
    add(kick(), t, 1.0)
    if beat % 4 in (1, 3):
        add(snap(), t, 1.0, 0.15)
    for s in range(4):  # shaker em semicolcheias com acento
        add(shaker(), t + s * BEAT / 4, 1.0 if s == 2 else 0.55, -0.3 if s % 2 else 0.3)
    beat += 1
    t += BEAT

bar = 0
t = DROP
while t < END:
    root, ch = CH[bar % 4]
    length = min(4 * BEAT, END - t)
    add(pad(ch, length + 0.3), t, 1.0)
    # piano: acorde na 1 e na "e" do 2 (levada pop leve)
    for off in (0.0, 1.5 * BEAT, 3.0 * BEAT):
        if off < length:
            for j, f in enumerate(ch):
                add(epiano(f, min(1.4, length - off + 0.2), 0.8), t + off + j * 0.015, 1.0, -0.25 + 0.17 * j)
    # baixo: semínima + colcheia sincopada
    for off, mult in ((0.0, 1), (1.5 * BEAT, 1), (2.0 * BEAT, 2), (3.0 * BEAT, 1)):
        if off < length:
            add(bass(root * mult, BEAT * 0.9), t + off, 1.0)
    # melodia de sininhos a partir da 3ª parte
    if t >= 12.0:
        pattern = [0, 2, 4, 3, 2, 1]
        for k, step in enumerate(pattern):
            off = k * (4 * BEAT / len(pattern))
            if off < length:
                add(bell(SCALE[(step + bar) % len(SCALE)]), t + off, 0.9, 0.35 if k % 2 else -0.35)
    bar += 1
    t += 4 * BEAT

# transições suaves
for c in CUTS[1:]:
    add(shimmer(0.8), c - 0.8, 1.0)
    for i, f in enumerate([1046.5, 1318.5, 1567.98]):
        add(bell(f, 1.0), c + i * 0.07, 0.8, -0.3 + 0.3 * i)

# final: acorde Fmaj9 sustentado
for j, f in enumerate([174.61, 220.0, 261.63, 329.63, 392.0]):
    add(epiano(f, 1.8, 1.0), END + j * 0.04, 1.0, -0.3 + 0.15 * j)
add(bell(1396.91, 1.8), END + 0.2, 1.0)

# ---------- reverb simples (ecos difusos) ----------
mix = np.stack([L, R], axis=1)
wet = np.zeros_like(mix)
for d, g in ((0.031, 0.35), (0.047, 0.3), (0.071, 0.25), (0.113, 0.2), (0.173, 0.15), (0.241, 0.1)):
    k = int(d * SR)
    wet[k:, 0] += mix[:-k, 1] * g
    wet[k:, 1] += mix[:-k, 0] * g
wet = lp(wet.T, 5000).T
mix = mix + 0.6 * wet

# ducking leve com o bumbo
duck = np.ones(N)
t = DROP
while t < END:
    i = int(t * SR)
    n = min(int(0.2 * SR), N - i)
    duck[i:i + n] = np.minimum(duck[i:i + n], 1 - 0.3 * np.exp(-np.arange(n) / SR / 0.08))
    t += BEAT
mix *= duck[:, None]

tt = np.arange(N) / SR
mix *= np.clip((DUR - tt) / 0.8, 0, 1)[:, None]
mix = np.tanh(mix * 0.9)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.89

wavfile.write(sys.argv[1] if len(sys.argv) > 1 else 'trilha-feminina.wav', SR, (mix * 32767).astype(np.int16))
print('ok')
