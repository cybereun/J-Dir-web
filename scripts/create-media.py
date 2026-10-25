"""Generate original audio and motion-demo frames; no personal or third-party media."""
import math, wave, struct, os
from PIL import Image, ImageDraw
os.makedirs('public/samples',exist_ok=True)
rate=22050; duration=12
with wave.open('public/samples/slow-afternoon.wav','w') as out:
 out.setparams((1,2,rate,0,'NONE','not compressed'))
 notes=[261.63,329.63,392,493.88,440,392,329.63,293.66]
 samples=[]
 for i in range(rate*duration):
  t=i/rate; local=t%1.5; n=notes[int(t/1.5)%len(notes)]
  envelope=min(local/.03,1)*math.exp(-local*2.1)*min((duration-t)/.5,1)
  value=(math.sin(2*math.pi*n*t)+.25*math.sin(2*math.pi*n*2*t))*.22*envelope
  samples.append(struct.pack('<h',int(value*32767)))
 out.writeframes(b''.join(samples))
os.makedirs('artifacts/frames',exist_ok=True)
for f in range(180):
 t=f/30; im=Image.new('RGB',(640,400),'#294739');d=ImageDraw.Draw(im)
 for j,(x,y) in enumerate([(150,65),(325,65),(150,195),(325,195)]):
  d.rounded_rectangle((x,y,x+160,y+115),12,fill=['#c6dca2','#a8c393','#8eae80','#b6ce9a'][j])
  d.rounded_rectangle((x+15,y+18,x+75,y+24),3,fill='#658461')
  for k in range(3):d.rounded_rectangle((x+15,y+42+k*17,x+133,y+46+k*17),2,fill='#e2eac8')
 progress=(t%3)/3;s=progress*progress*(3-2*progress)
 x=205+175*s;y=130+130*s
 d.rounded_rectangle((x,y,x+55,y+40),6,fill='#f9f3db',outline='#516f52',width=2)
 d.line((x+10,y+14,x+44,y+14),fill='#a7b68a',width=3)
 d.text((247,345),'FIND YOUR FLOW',fill='#e4ebd1')
 im.save(f'artifacts/frames/{f:03}.png')
