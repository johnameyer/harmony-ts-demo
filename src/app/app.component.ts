import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbsoluteNote, IncompleteChord, Scale, Harmony, RomanNumeral, Progression, Accidental, ChordQuality, Interval, IntervalQuality } from 'harmony-ts';
import Vex from "vexflow";

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
  @ViewChild('chords') chords: ElementRef;
  @ViewChild('vexflow') vexflow: ElementRef;
  @ViewChild('trigger') trigger: ElementRef;
  @ViewChild('error') error: ElementRef;
  
  submit(): false {
    const numerals = this.chords.nativeElement.value.split(' ');
    const scale = Scale.Major.notes;
    const constraints = numerals.map(numeral => new IncompleteChord({romanNumeral: new RomanNumeral(numeral, scale)}));
    const result = Harmony.harmonizeAll(scale, constraints, new RomanNumeral('I', scale), [...Progression.Major.basic, ...Progression.Major.basicInversions, ...Progression.Major.dominantSevenths, ...Progression.Major.basicPredominant, ...Progression.Major.subdominantSevenths, ...Progression.Major.submediant, ...Progression.Major.cad64, ...Progression.Major.tonicSubstitutes]);
    
    if(result) {
      for(let chord of result) {
        this.results.push(chord.voices.map(note => note.name));
      } 
      
      let vf = new Vex.Flow.Factory({
        renderer: {elementId: 'vexflow', width: 1000, height: 300}
      });
      
      var system = vf.System({
        x: 30,
        width: 500,
      });

      console.log(result);
      
      const [sopranoVoice, altoVoice, tenorVoice, bassVoice, text] = result
      .reduce((acc, chord) => {
        const map = (note: AbsoluteNote, stem_direction, clef) => {
          let staveNote = vf.StaveNote({ keys: [note.letterName + Accidental.toString(note.accidental) + '/' + note.octavePosition], stem_direction, clef, duration: 'q' });
          if(note.accidental) {
            staveNote.addAccidental(0, vf.Accidental({ type: Accidental.toString(note.accidental)}));
          }
          return staveNote;
        }
        acc[0].push(map(chord.voices[0], 1, 'treble'));
        acc[1].push(map(chord.voices[1], -1, 'treble'));
        acc[2].push(map(chord.voices[2], 1, 'bass'));
        acc[3].push(map(chord.voices[3], -1, 'bass'));
        let textNote = vf.TextNote({ text: chord.romanNumeral.name.match('[viVI]+')[0], duration: 'q', superscript: '', subscript: '' });
        if(chord.romanNumeral.quality == ChordQuality.DIMINISHED) {
          if(chord.romanNumeral.intervals.find(Interval.ofSize('7')) == IntervalQuality.MINOR) {
            textNote.superscript = Vex.Flow.unicode['o-with-slash'];
          } else {
            textNote.superscript = Vex.Flow.unicode['circle'];
          }
        }
        textNote.superscript += chord.romanNumeral.inversionSymbol[0];
        textNote.subscript += chord.romanNumeral.inversionSymbol[1];
        acc[4].push(textNote);
        return acc;
      }, [[], [], [], [], []])
      .map(tickables => vf.Voice().setMode(Vex.Flow.Voice.Mode.SOFT).addTickables(tickables));
      
      text.getTickables().forEach((note) => {
        note.font = { family: 'Serif', size: 15, weight: '' };
        note.setLine(13);
        note.setJustification(Vex.Flow.TextNote.Justification.CENTER);
      });
      
      system.addStave({ voices: [sopranoVoice, altoVoice] }).addKeySignature('C').setClef('treble').setTimeSignature('4/4');
      system.addStave({ voices: [tenorVoice, bassVoice, text] }).addKeySignature('C').setClef('bass').setTimeSignature('4/4');

      system.addConnector().setType(Vex.Flow.StaveConnector.type.BRACE);
      system.addConnector().setType(Vex.Flow.StaveConnector.type.SINGLE_LEFT);
      system.addConnector().setType(Vex.Flow.StaveConnector.type.SINGLE_RIGHT);
      
      vf.draw();
      
      this.trigger.nativeElement.onclick = null;
      this.trigger.nativeElement.onclick = async () => {
        const Tone = await import('tone');
        const soprano = new Tone.Synth().toMaster();
        const alto = new Tone.Synth().toMaster();
        const tenor = new Tone.Synth().toMaster();
        const bass = new Tone.Synth().toMaster();
        soprano.context.resume();
        
        if(result != null){
          for(let x = 0; x <= result.length; x++) {
            setTimeout((x, chord) => {
              soprano.triggerRelease();
              if (chord?.voices[0]) {
                soprano.triggerAttack(chord.voices[0].name);
                sopranoVoice.tickables[x - 1]?.setStyle({ fillStyle: 'black', strokeStyle: 'black' });
                sopranoVoice.tickables[x].setStyle({ fillStyle: 'blue', strokeStyle: 'blue' });
                sopranoVoice.draw();
              }
              alto.triggerRelease();
              if (chord?.voices[1]) {
                alto.triggerAttack(chord.voices[1].name);
                altoVoice.tickables[x - 1]?.setStyle({ fillStyle: 'black', strokeStyle: 'black' });
                altoVoice.tickables[x].setStyle({ fillStyle: 'blue', strokeStyle: 'blue' });
                altoVoice.draw();
              }
              tenor.triggerRelease();
              if (chord?.voices[2]) {
                tenor.triggerAttack(chord.voices[2].name);
                tenorVoice.tickables[x - 1]?.setStyle({ fillStyle: 'black', strokeStyle: 'black' });
                tenorVoice.tickables[x].setStyle({ fillStyle: 'blue', strokeStyle: 'blue' });
                tenorVoice.draw();
              }
              bass.triggerRelease();
              if (chord?.voices[3]) {
                bass.triggerAttack(chord.voices[3].name);
                bassVoice.tickables[x - 1]?.setStyle({ fillStyle: 'black', strokeStyle: 'black' });
                bassVoice.tickables[x].setStyle({ fillStyle: 'blue', strokeStyle: 'blue' });
                bassVoice.draw();
              }
            }, x * 1000, x, result[x]);
          }
        }
      };
    } else {
      this.error.nativeElement.innerHTML = 'Could not find solution for ' + numerals;
    }
    return false;
  }
}
