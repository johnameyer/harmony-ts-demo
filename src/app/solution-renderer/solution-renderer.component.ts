import { Component, OnInit, ViewChild, ElementRef, Input, AfterContentInit, AfterViewChecked, AfterViewInit } from '@angular/core';
import { HarmonizedChord, AbsoluteNote, IncompleteChord, Scale, Harmony, RomanNumeral, Accidental, ChordQuality, Interval, IntervalQuality, Key } from 'harmony-ts';

import Vex from 'vexflow';

@Component({
  selector: 'harmony-ts-demo-solution-renderer',
  templateUrl: './solution-renderer.component.html',
  styleUrls: ['./solution-renderer.component.scss']
})
export class SolutionRendererComponent implements AfterViewInit {
  
  @Input('result') result: HarmonizedChord[];

  @ViewChild('vexflow') vexflow: ElementRef;
  sopranoVoice: any;
  altoVoice: any;
  tenorVoice: any;
  bassVoice: any;

  constructor() { }

  ngAfterViewInit() {
    this.vexflow.nativeElement.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const vf = new Vex.Flow.Factory({
      renderer: {elementId: this.vexflow.nativeElement.id, width: 1000, height: 400}
    });

    const system = vf.System({
      x: 30,
      width: 1000,
    });

    console.log(this.result);

    const scale = this.result[0].romanNumeral.scale;

    const [sopranoVoice, altoVoice, tenorVoice, bassVoice, text] = this.result
    .reduce((acc, chord) => {
      const map = (note: AbsoluteNote, stem_direction, clef) => {
        const staveNote = vf.StaveNote({ keys: [note.letterName + Accidental.toString(note.accidental) + '/' + note.octavePosition], stem_direction, clef, duration: 'q' });
        if (Scale.getNamesOfScale(scale).indexOf(note.simpleName) == -1) {
          //TODO courtesy accidentals
          staveNote.addAccidental(0, vf.Accidental({ type: Accidental.toString(note.accidental) || 'n'}));
        }
        return staveNote;
      };
      acc[0].push(map(chord.voices[0], 1, 'treble'));
      acc[1].push(map(chord.voices[1], -1, 'treble'));
      acc[2].push(map(chord.voices[2], 1, 'bass'));
      acc[3].push(map(chord.voices[3], -1, 'bass'));
      const textNote: any = vf.TextNote({ text: chord.romanNumeral.name.match('[viVI]+')[0], duration: 'q', superscript: '', subscript: '' });
      if (chord.romanNumeral.quality == ChordQuality.DIMINISHED) {
        if (chord.romanNumeral.intervals?.find(Interval.ofSize('7'))?.quality == IntervalQuality.MINOR) {
          textNote.superscript = Vex.Flow.unicode['o-with-slash'];
        } else {
          textNote.superscript = Vex.Flow.unicode.circle;
        }
      }
      textNote.superscript += chord.romanNumeral.inversionSymbol[0];
      textNote.subscript += chord.romanNumeral.inversionSymbol[1];
      if(chord.romanNumeral.applied){
        textNote.text += '/' + chord.romanNumeral.applied;
      }
      textNote.text = chord.flags?.sequence ? '(' + textNote.text + ')' : textNote.text;
      if(chord.flags.pivot) {
        textNote.text += '(in ' + Key.toString(chord.romanNumeral.scale[0]) + (chord.romanNumeral.scale[1] === Scale.Quality.MAJOR ? '' : 'm') + ')';
      }
      acc[4].push(textNote);
      return acc;
    }, [[], [], [], [], []])
    .map(tickables => vf.Voice(undefined).setMode(Vex.Flow.Voice.Mode.SOFT).addTickables(tickables));

    text.getTickables().forEach((note) => {
      //@ts-ignore
      note.font = { family: 'Serif', size: 15, weight: '' };
      //@ts-ignore
      note.setLine(13);
      //@ts-ignore
      note.setJustification(Vex.Flow.TextNote.Justification.CENTER);
    });

    system.addStave({ voices: [sopranoVoice, altoVoice] }).addKeySignature(Key.toString(scale[0])).addClef('treble').addTimeSignature('4/4');
    system.addStave({ voices: [tenorVoice, bassVoice, text] }).addKeySignature(Key.toString(scale[0])).addClef('bass').addTimeSignature('4/4');

    system.addConnector().setType(Vex.Flow.StaveConnector.type.BRACE);
    system.addConnector().setType(Vex.Flow.StaveConnector.type.SINGLE_LEFT);
    system.addConnector().setType(Vex.Flow.StaveConnector.type.SINGLE_RIGHT);

    this.sopranoVoice = sopranoVoice;
    this.altoVoice = altoVoice;
    this.tenorVoice = tenorVoice;
    this.bassVoice = bassVoice;

    vf.draw();
  }

  async click() {
    const Tone = await import('tone');
    const piano = new Tone.Sampler({
      "A0" : "A0.[mp3|ogg]",
      "C1" : "C1.[mp3|ogg]",
      "D#1" : "Ds1.[mp3|ogg]",
      "F#1" : "Fs1.[mp3|ogg]",
      "A1" : "A1.[mp3|ogg]",
      "C2" : "C2.[mp3|ogg]",
      "D#2" : "Ds2.[mp3|ogg]",
      "F#2" : "Fs2.[mp3|ogg]",
      "A2" : "A2.[mp3|ogg]",
      "C3" : "C3.[mp3|ogg]",
      "D#3" : "Ds3.[mp3|ogg]",
      "F#3" : "Fs3.[mp3|ogg]",
      "A3" : "A3.[mp3|ogg]",
      "C4" : "C4.[mp3|ogg]",
      "D#4" : "Ds4.[mp3|ogg]",
      "F#4" : "Fs4.[mp3|ogg]",
      "A4" : "A4.[mp3|ogg]",
      "C5" : "C5.[mp3|ogg]",
      "D#5" : "Ds5.[mp3|ogg]",
      "F#5" : "Fs5.[mp3|ogg]",
      "A5" : "A5.[mp3|ogg]",
      "C6" : "C6.[mp3|ogg]",
      "D#6" : "Ds6.[mp3|ogg]",
      "F#6" : "Fs6.[mp3|ogg]",
      "A6" : "A6.[mp3|ogg]",
      "C7" : "C7.[mp3|ogg]",
      "D#7" : "Ds7.[mp3|ogg]",
      "F#7" : "Fs7.[mp3|ogg]",
      "A7" : "A7.[mp3|ogg]",
      "C8" : "C8.[mp3|ogg]"
    }, {
      "release" : 1,
      "baseUrl" : "./assets/salamander/"
    });
    piano.toMaster();
    piano.context.resume();

    await new Promise(resolve => Tone.Buffer.on('load', resolve));
    for (let tick = 0; tick <= this.result.length; tick++) {
      setTimeout((x, chord) => {
        piano.releaseAll();
        if (chord?.voices[0]) {
          piano.triggerAttack(chord.voices[0].name);
          this.sopranoVoice.tickables[x - 1]?.setStyle({ fillStyle: 'black', strokeStyle: 'black' });
          this.sopranoVoice.tickables[x].setStyle({ fillStyle: 'blue', strokeStyle: 'blue' });
          this.sopranoVoice.draw();
        }
        if (chord?.voices[1]) {
          piano.triggerAttack(chord.voices[1].name);
          this.altoVoice.tickables[x - 1]?.setStyle({ fillStyle: 'black', strokeStyle: 'black' });
          this.altoVoice.tickables[x].setStyle({ fillStyle: 'blue', strokeStyle: 'blue' });
          this.altoVoice.draw();
        }
        if (chord?.voices[2]) {
          piano.triggerAttack(chord.voices[2].name);
          this.tenorVoice.tickables[x - 1]?.setStyle({ fillStyle: 'black', strokeStyle: 'black' });
          this.tenorVoice.tickables[x].setStyle({ fillStyle: 'blue', strokeStyle: 'blue' });
          this.tenorVoice.draw();
        }
        if (chord?.voices[3]) {
          piano.triggerAttack(chord.voices[3].name);
          this.bassVoice.tickables[x - 1]?.setStyle({ fillStyle: 'black', strokeStyle: 'black' });
          this.bassVoice.tickables[x].setStyle({ fillStyle: 'blue', strokeStyle: 'blue' });
          this.bassVoice.draw();
        }
      }, tick * 2000, tick, this.result[tick]);
    }
  }
}
