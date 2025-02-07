import { Component, ViewChild, ElementRef, Input, AfterViewInit } from '@angular/core';
import { AbsoluteNote, Scale, Accidental, ChordQuality, Interval, IntervalQuality, Key, ScaleDegree, CompleteChord } from 'harmony-ts';

import Vex from 'vexflow';
import { init, playNotes, releaseAll } from './player';

@Component({
    selector: 'harmony-ts-demo-solution-renderer',
    templateUrl: './solution-renderer.component.html',
    styleUrls: ['./solution-renderer.component.scss'],
    standalone: true
})
export class SolutionRendererComponent implements AfterViewInit {
  
  @Input('result') result: CompleteChord[];

  @ViewChild('vexflow') vexflow: ElementRef;
  voices: Vex.Flow.Voice[];

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

    const namesOfScale = Scale.getNotesOfScale(scale)
    const accidentalsInScale = namesOfScale.reduce((agg, item) => ({...agg, [item.letterName]: item.accidental}), {});
    const runningAccidentals = {
      'treble': {},
      'bass': {},
    }

    const [sopranoVoice, altoVoice, tenorVoice, bassVoice, text] = this.result
    .reduce((acc, chord) => {
      const map = (note: AbsoluteNote, stem_direction, clef) => {
        const staveNote = vf.StaveNote({ keys: [note.letterName + Accidental.toString(note.accidental) + '/' + note.octavePosition], stem_direction, clef, duration: 'q' });
        const previousWasAltered = runningAccidentals[clef][note.letterName + note.octavePosition];
        const currentIsAltered = accidentalsInScale[note.letterName] != note.accidental;
        if(note.letterName == 'B') {
          console.log(runningAccidentals, previousWasAltered, currentIsAltered);
        }
        if (previousWasAltered || currentIsAltered) {
          staveNote.addAccidental(0, vf.Accidental({ type: Accidental.toString(note.accidental) || 'n'}));
          runningAccidentals[clef][note.letterName + note.octavePosition] = currentIsAltered;
        }
        return staveNote;
      };
      acc[0].push(map(chord.voices[0], 1, 'treble'));
      acc[1].push(map(chord.voices[1], -1, 'treble'));
      acc[2].push(map(chord.voices[2], 1, 'bass'));
      acc[3].push(map(chord.voices[3], -1, 'bass'));
      const textNote: any = vf.TextNote({ text: chord.romanNumeral.name.match('[#b]?[viVI]+')[0], duration: 'q', superscript: '', subscript: '' });
      if(chord.romanNumeral.name.includes('0')) {
        textNote.superscript = Vex.Flow.unicode['o-with-slash'];
      } else if(chord.romanNumeral.name.includes('o')) {
        textNote.superscript = Vex.Flow.unicode.circle;
      }
      textNote.superscript += chord.romanNumeral.inversionSymbol[0];
      textNote.subscript += chord.romanNumeral.inversionSymbol[1];
      if(chord.romanNumeral.applied){
        textNote.text += '/' + ScaleDegree.toRomanNumeral(chord.romanNumeral.applied);
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
      note.setLine(11);
      //@ts-ignore
      note.setJustification(Vex.Flow.TextNote.Justification.CENTER);
    });

    const scaleName = Scale.toString(scale).replace("M", "");
    system.addStave({ voices: [sopranoVoice, altoVoice] }).addKeySignature(scaleName).addClef('treble'); //.addTimeSignature('4/4');
    system.addStave({ voices: [tenorVoice, bassVoice, text] }).addKeySignature(scaleName).addClef('bass'); //.addTimeSignature('4/4');

    system.addConnector().setType(Vex.Flow.StaveConnector.type.BRACE);
    system.addConnector().setType(Vex.Flow.StaveConnector.type.SINGLE_LEFT);
    system.addConnector().setType(Vex.Flow.StaveConnector.type.SINGLE_RIGHT);

    this.voices = [ sopranoVoice, altoVoice, tenorVoice, bassVoice ];

    vf.draw();
  }

  async play() {
    await init();
    for (let tick = 0; tick <= this.result.length; tick++) {
      setTimeout((x, chord) => {
        releaseAll();

        for(let i = 0; i < this.voices.length; i++) {
          (this.voices[i].getTickables()[x - 1] as Vex.Flow.StaveNote)?.setStyle({ fillStyle: 'black', strokeStyle: 'black' });
          if (chord?.voices[0]) {
            (this.voices[i].getTickables()[x] as Vex.Flow.StaveNote).setStyle({ fillStyle: 'blue', strokeStyle: 'blue' });
          }
          (this.voices[i] as any).draw();
        }

        if(chord !== undefined) {
          playNotes(chord.voices);
        }
      }, tick * 1000, tick, this.result[tick]);
    }
  }
  
}
