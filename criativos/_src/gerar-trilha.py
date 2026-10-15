"""Trilha original (livre de direitos) para o Reels de 20s, sincronizada com os cortes do vídeo.

Uso: python3 gerar-trilha.py saida.wav
Cortes do vídeo: 3.6s, 7.6s, 12.2s, 16.2s (ver video-reels-juca.html).
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 44100
DUR = 20.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)

CUTS = [3.6, 7.6, 12.2, 16.2]
DROP = 3.6          # entrada da batida
BPM = 120
BEAT = 60 / BPM


def env(n, a=0.005, d=0.3):
    t = np.arange(n) / SR
    att = np.clip(t / a, 0, 1)
    return att * np.exp(-t / d)


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


def saw(f, n, detune=(0.0,)):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for d in detune:
        ph = (t * f * (1 + d)) % 1.0
        out += 2 * ph - 1
    return out / len(detune)


# ---------- instrumentos ----------
def kick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.04)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(n, 0.001, 0.18) * 1.1


def clap():
    n = int(0.25 * SR)
    x = hp(lp(rng.standard_normal(n), 5000), 900)
    e = env(n, 0.001, 0.07)
    for k in (0.008, 0.016):  # "palmas" múltiplas
        j = int(k * SR)
        e[j:] += 0.6 * env(n - j, 0.001, 0.05)
    return x * e * 0.35


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    x = hp(rng.standard_normal(n), 7000, 4)
    return x * env(n, 0.001, 0.06 if open_ else 0.015) * 0.18


def tick():  # relógio (tensão da intro: "pressa")
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2400 * t) + 0.5 * np.sin(2 * np.pi * 3700 * t)) * env(n, 0.0005, 0.008) * 0.22


def impact():
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = 30 + 70 * np.exp(-t / 0.08)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.5)
    noise = lp(rng.standard_normal(n), 2500) * env(n, 0.001, 0.25) * 0.35
    return (boom + noise) * 0.9


def riser(length):
    n = int(length * SR)
    t = np.linspace(0, 1, n)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    # passa-alta que "abre" ao longo do tempo (em blocos)
    blocks = 12
    for b in range(blocks):
        a, z = b * n // blocks, (b + 1) * n // blocks
        out[a:z] = hp(x[a:z], 300 + 6000 * (b / blocks))
    return out * t ** 2.2 * 0.22


def pluck(f, length=0.35):
    n = int(length * SR)
    s = saw(f, n, (0, 0.004))
    s = lp(s, 3200)
    return s * env(n, 0.002, 0.12) * 0.16


def pad(freqs, length):
    n = int(length * SR)
    s = sum(saw(f, n, (-0.006, 0.0, 0.006)) for f in freqs) / len(freqs)
    s = lp(s, 1800)
    t = np.arange(n) / SR
    fade = np.clip(t / 0.25, 0, 1) * np.clip((length - t) / 0.25, 0, 1)
    return s * fade * 0.16


def bass(f, length):
    n = int(length * SR)
    s = lp(saw(f, n, (0, 0.003)), 600)
    return s * env(n, 0.004, 0.16) * 0.42


# ---------- harmonia: Am – F – C – G ----------
CH = [  # (fundamental do baixo, notas do acorde)
    (110.0, [220.0, 261.63, 329.63]),   # Am
    (87.31, [174.61, 220.0, 261.63]),   # F
    (130.81, [261.63, 329.63, 392.0]),  # C
    (98.0, [196.0, 246.94, 293.66]),    # G
]

# ---------- INTRO (0 – 3.6): tensão ----------
add(pad([110.0, 164.81, 220.0], 3.6), 0, 0.9)
drone_n = int(3.6 * SR)
drone = np.sin(2 * np.pi * 55 * np.arange(drone_n) / SR) * np.clip(np.arange(drone_n) / SR / 0.5, 0, 1) * 0.25
add(drone, 0)
t = 0.0
while t < 3.4:
    add(tick(), t, 1.0, 0.3 if int(t * 4) % 2 else -0.3)
    t += 0.25
add(impact(), 0.0, 0.8)                    # "JUROS"
add(riser(0.5), 0.15, 0.6)                 # risco
add(impact(), 1.6, 0.9)                    # "PRESSA."
add(riser(1.2), DROP - 1.2, 1.0)           # subida para a batida

# ---------- CORPO (3.6 – 20): batida 120 BPM ----------
END = 19.4
beat = 0
t = DROP
while t < END:
    bar_pos = beat % 4
    add(kick(), t, 1.0)
    if bar_pos in (1, 3):
        add(clap(), t, 1.0, 0.1)
    add(hat(), t + BEAT / 2, 1.0, -0.25)
    if beat % 2 == 1:
        add(hat(True), t + BEAT / 2, 0.6, 0.25)
    beat += 1
    t += BEAT

# acordes (1 compasso = 2s) + baixo em colcheias + arpejo
bar = 0
t = DROP
while t < END:
    root, chord = CH[bar % 4]
    length = min(4 * BEAT, END - t)
    add(pad(chord, length + 0.1), t, 1.0)
    k = 0
    while k * BEAT / 2 < length - 1e-6:
        add(bass(root if k % 2 == 0 else root * 2, BEAT / 2), t + k * BEAT / 2, 1.0)
        k += 1
    # arpejo em semicolcheias a partir da 3ª parte (mais energia no final)
    if t >= 12.0:
        notes = [chord[0] * 2, chord[1] * 2, chord[2] * 2, chord[1] * 2]
        k = 0
        while k * BEAT / 4 < length - 1e-6:
            add(pluck(notes[k % 4]), t + k * BEAT / 4, 1.0, 0.35 if k % 2 else -0.35)
            k += 1
    bar += 1
    t += 4 * BEAT

# transições nos cortes
for c in CUTS[1:]:
    add(riser(0.6), c - 0.6, 0.7)
    add(impact(), c, 0.55)

# final: acorde sustentado
add(pad([220.0, 261.63, 329.63, 440.0], 1.2), END, 1.2)
add(impact(), END, 0.7)

# ---------- sidechain (ducking) da batida ----------
duck = np.ones(N)
t = DROP
while t < END:
    i = int(t * SR)
    n = int(0.22 * SR)
    seg = 1 - 0.55 * np.exp(-np.arange(n) / SR / 0.07)
    duck[i:i + n] = np.minimum(duck[i:i + n], seg[: max(0, min(n, N - i))])
    t += BEAT

mix = np.stack([L, R], axis=1)
mix[:, 0] *= 0.6 + 0.4 * duck
mix[:, 1] *= 0.6 + 0.4 * duck

# fade de saída e limitador suave
tt = np.arange(N) / SR
mix *= np.clip((DUR - tt) / 0.6, 0, 1)[:, None]
mix = np.tanh(mix * 0.9)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.89  # ~ -1 dBFS

wavfile.write(sys.argv[1] if len(sys.argv) > 1 else 'trilha.wav', SR, (mix * 32767).astype(np.int16))
print('ok')
