#!/usr/bin/env bash
# Przegląd techniczny renderu: ffprobe + black/freeze detect + contact sheet 4x3 + 3 klatki full-res.
# Użycie: tools/review.sh out/001-slug/v1.mp4
set -euo pipefail
IN="$1"; DIR="$(dirname "$IN")"; BASE="$(basename "$IN" .mp4)"
read -r W H FPS NB DUR CODEC PIX < <(ffprobe -v error -select_streams v:0 -count_frames \
  -show_entries stream=width,height,r_frame_rate,nb_read_frames,codec_name,pix_fmt -show_entries format=duration \
  -of default=nw=1 "$IN" | awk -F= '{a[$1]=$2} END{print a["width"],a["height"],a["r_frame_rate"],a["nb_read_frames"],a["duration"],a["codec_name"],a["pix_fmt"]}')
echo "== $IN"
echo "res=${W}x${H} fps=${FPS} frames=${NB} dur=${DUR}s codec=${CODEC} pix=${PIX} size=$(du -h "$IN" | cut -f1)"
BLACK=$(ffmpeg -hide_banner -nostats -i "$IN" -vf "blackdetect=d=0.1:pix_th=0.06" -an -f null - 2>&1 | grep -o 'black_start.*' || true)
FREEZE=$(ffmpeg -hide_banner -nostats -i "$IN" -vf "freezedetect=n=0.0008:d=0.5" -map 0:v -f null - 2>&1 | grep -oE 'freeze_(start|duration|end): [0-9.]+' | paste -sd' ' || true)
echo "black: ${BLACK:-none}"
echo "freeze(>0.5s): ${FREEZE:-none}"
# 12 równomiernych klatek, środek każdego przedziału, z etykietą czasu
STEP=$(( NB / 12 )); OFF=$(( STEP / 2 ))
ffmpeg -hide_banner -loglevel error -y -i "$IN" -vf "select='eq(mod(n-${OFF}\,${STEP})\,0)*gte(n\,${OFF})',scale=360:640:flags=lanczos,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf:text='%{pts\:hms}':x=8:y=8:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=4,tile=4x3:padding=6:color=0x777777" -frames:v 1 -fps_mode vfr "$DIR/${BASE}_sheet.png"
for spec in "start:0.12" "mid:0.5" "end:0.94"; do
  name=${spec%%:*}; frac=${spec##*:}
  t=$(awk -v d="$DUR" -v f="$frac" 'BEGIN{printf "%.3f", d*f}')
  ffmpeg -hide_banner -loglevel error -y -ss "$t" -i "$IN" -frames:v 1 "$DIR/${BASE}_${name}.png"
done
echo "sheet: $DIR/${BASE}_sheet.png  frames: ${BASE}_{start,mid,end}.png"
