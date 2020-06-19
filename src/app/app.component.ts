import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbsoluteNote, IncompleteChord, Scale, Harmony, RomanNumeral, Progression, Accidental, ChordQuality, Interval, IntervalQuality } from 'harmony-ts';
import Vex from 'vexflow';

declare global {
  namespace Vex {
    namespace Flow {
      const Factory: any;
    }
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  {
  results: string[] = [];
  @ViewChild('key') key: ElementRef;
  @ViewChild('chords') chords: ElementRef;
  @ViewChild('spacing') spacing: ElementRef;
  @ViewChild('useProgressions') useProgressions: ElementRef;
  @ViewChild('vexflow') vexflow: ElementRef;
  @ViewChild('trigger') trigger: ElementRef;
  @ViewChild('error') error: ElementRef;

  current: any;

  submit(): false {
    const numerals = this.chords.nativeElement.value.split(' ');
    const [key, minor] = this.key.nativeElement.value.split('m');
    const scale = minor === undefined ? Scale.transpose(Scale.Major.notes, key) : Scale.transpose(Scale.NaturalMinor.notes, key);
    const constraints = numerals.map(numeral => new IncompleteChord({romanNumeral: new RomanNumeral(numeral, scale)}));
    if(this.spacing.nativeElement.value) {
      constraints[0] = new IncompleteChord({romanNumeral: new RomanNumeral(numerals[0], scale), voices: this.spacing.nativeElement.value.split(' ').map(note => new AbsoluteNote(note))});
    }
    const start = numerals[0];// minor === undefined ? 'I' : 'i';
    const enabled = 
                    // minor === undefined ?
                    [...Progression.Major.basic, ...Progression.Major.basicInversions, ...Progression.Major.dominantSevenths, ...Progression.Major.basicPredominant, ...Progression.Major.subdominantSevenths, ...Progression.Major.submediant, ...Progression.Major.cad64, ...Progression.Major.tonicSubstitutes, ...Progression.Major.secondaryDominant]
                    // : [...Progression.Minor.basic, ...Progression.Minor.basicInversions, ...Progression.Minor.dominantSevenths, ...Progression.Minor.basicPredominant, ...Progression.Minor.subdominantSevenths, ...Progression.Minor.submediant, ...Progression.Minor.cad64, ...Progression.Minor.tonicSubstitutes];
    ;
    const result = Harmony.harmonizeAll({scale, start, constraints, greedy: false, enabled, useProgressions: this.useProgressions.nativeElement.checked});

    if (result.solution) {
      for (const chord of result.solution) {
        this.results.push(chord.voices.map(note => note.name));
      }

      const vf = new Vex.Flow.Factory({
        renderer: {elementId: 'vexflow', width: 1000, height: 300}
      });

      const system = vf.System({
        x: 30,
        width: 500,
      });

      console.log(result);

      const [sopranoVoice, altoVoice, tenorVoice, bassVoice, text] = result.solution
      .reduce((acc, chord) => {
        const map = (note: AbsoluteNote, stem_direction, clef) => {
          const staveNote = vf.StaveNote({ keys: [note.letterName + Accidental.toString(note.accidental) + '/' + note.octavePosition], stem_direction, clef, duration: 'q' });
          if (scale.indexOf(note.simpleName) == -1) {
            //TODO courtesy accidentals
            staveNote.addAccidental(0, vf.Accidental({ type: Accidental.toString(note.accidental) || 'n'}));
          }
          return staveNote;
        };
        acc[0].push(map(chord.voices[0], 1, 'treble'));
        acc[1].push(map(chord.voices[1], -1, 'treble'));
        acc[2].push(map(chord.voices[2], 1, 'bass'));
        acc[3].push(map(chord.voices[3], -1, 'bass'));
        const textNote = vf.TextNote({ text: chord.romanNumeral.name.match('[viVI]+')[0], duration: 'q', superscript: '', subscript: '' });
        if (chord.romanNumeral.quality == ChordQuality.DIMINISHED) {
          if (chord.romanNumeral.intervals.find(Interval.ofSize('7')) == IntervalQuality.MINOR) {
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
        acc[4].push(textNote);
        return acc;
      }, [[], [], [], [], []])
      .map(tickables => vf.Voice().setMode(Vex.Flow.Voice.Mode.SOFT).addTickables(tickables));

      text.getTickables().forEach((note) => {
        note.font = { family: 'Serif', size: 15, weight: '' };
        note.setLine(13);
        note.setJustification(Vex.Flow.TextNote.Justification.CENTER);
      });

      system.addStave({ voices: [sopranoVoice, altoVoice] }).addKeySignature(this.key.nativeElement.value).setClef('treble').setTimeSignature('4/4');
      system.addStave({ voices: [tenorVoice, bassVoice, text] }).addKeySignature(this.key.nativeElement.value).setClef('bass').setTimeSignature('4/4');

      system.addConnector().setType(Vex.Flow.StaveConnector.type.BRACE);
      system.addConnector().setType(Vex.Flow.StaveConnector.type.SINGLE_LEFT);
      system.addConnector().setType(Vex.Flow.StaveConnector.type.SINGLE_RIGHT);

      vf.draw();

      this.trigger.nativeElement.onclick = null;
      this.trigger.nativeElement.onclick = async () => {
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

        this.current = result.solution;

        Tone.Buffer.on('load',  () => {
          const solution = result.solution;
          if(this.current !== solution) {
            return;
          }
          if (solution != null) {
            for (let x = 0; x <= result.solution.length; x++) {
              setTimeout((x, chord) => {
                piano.releaseAll();
                if (chord?.voices[0]) {
                  piano.triggerAttack(chord.voices[0].name);
                  sopranoVoice.tickables[x - 1]?.setStyle({ fillStyle: 'black', strokeStyle: 'black' });
                  sopranoVoice.tickables[x].setStyle({ fillStyle: 'blue', strokeStyle: 'blue' });
                  sopranoVoice.draw();
                }
                if (chord?.voices[1]) {
                  piano.triggerAttack(chord.voices[1].name);
                  altoVoice.tickables[x - 1]?.setStyle({ fillStyle: 'black', strokeStyle: 'black' });
                  altoVoice.tickables[x].setStyle({ fillStyle: 'blue', strokeStyle: 'blue' });
                  altoVoice.draw();
                }
                if (chord?.voices[2]) {
                  piano.triggerAttack(chord.voices[2].name);
                  tenorVoice.tickables[x - 1]?.setStyle({ fillStyle: 'black', strokeStyle: 'black' });
                  tenorVoice.tickables[x].setStyle({ fillStyle: 'blue', strokeStyle: 'blue' });
                  tenorVoice.draw();
                }
                if (chord?.voices[3]) {
                  piano.triggerAttack(chord.voices[3].name);
                  bassVoice.tickables[x - 1]?.setStyle({ fillStyle: 'black', strokeStyle: 'black' });
                  bassVoice.tickables[x].setStyle({ fillStyle: 'blue', strokeStyle: 'blue' });
                  bassVoice.draw();
                }
              }, x * 2000, x, result.solution[x]);
            }
          }
        });
      };
    } else {
      this.error.nativeElement.innerHTML = 'Could not find solution for ' + numerals + ' got to ' + numerals[result.furthest] + ' @ ' + result.furthest;
    }
    return false;
  }
}
