import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Button } from '@mantine/core';
import '../CSS/allCSS.css'

const AudioCutter = ({ audioFile }) => {
  const wavesurferRef = useRef(null);
  const cutWavesurferRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cutBlobUrl, setCutBlobUrl] = useState(null);
  const [isCutting, setIsCutting] = useState(false);

  const [startSelectorPosition, setStartSelectorPosition] = useState(0); // Position of the start selector
  const [endSelectorPosition, setEndSelectorPosition] = useState(0); // Position of the end selector

  // Set audio URL when file is uploaded
  useEffect(() => {
    if (audioFile) {
      const objectUrl = URL.createObjectURL(audioFile);
      setAudioUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [audioFile]);

  // Initialize main WaveSurfer when audio URL is available
  useEffect(() => {
    if (audioUrl) {
      wavesurferRef.current = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'green', // Set the waveform color to green
        progressColor: 'darkgreen', // Set the progress color to dark green
        height: 200,
        barWidth: 3,
        responsive: true,
        scrollParent: true,
        cursorWidth: 1,
        cursorColor: 'black',
        hideScrollbar: true,
      });

      wavesurferRef.current.load(audioUrl);

      wavesurferRef.current.on('ready', () => {
        const audioDuration = wavesurferRef.current.getDuration();
        setDuration(audioDuration);
        setEndTime(audioDuration); // Set the end time to match the full audio duration
        setEndSelectorPosition(audioDuration); // Position end selector at the end
      });

      return () => {
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
        }
      };
    }
  }, [audioUrl]);

  // Initialize cut WaveSurfer
  useEffect(() => {
    const initCutWaveSurfer = () => {
      if (cutWavesurferRef.current && document.getElementById('cutWaveform')) {
        cutWavesurferRef.current = WaveSurfer.create({
          container: '#cutWaveform',
          waveColor: 'green', // Set the waveform color to green
          progressColor: 'yellow', // Set the progress color to yellow
          height: 100,
          barWidth: 2,
          responsive: true,
          scrollParent: true,
          cursorWidth: 1,
          cursorColor: 'black',
          hideScrollbar: true,
        });
      }
    };

    initCutWaveSurfer();

    return () => {
      if (cutWavesurferRef.current) {
        cutWavesurferRef.current.destroy();
      }
    };
  }, []);

  // Toggle play/pause for the main audio
  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        wavesurferRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Cut the audio based on startTime and endTime (from the slider positions)
  const cutAudio = () => {
    if (startTime >= endTime || startTime < 0 || endTime > duration) {
      alert('Please select a valid start and end time.');
      return;
    }

    setIsCutting(true);

    const audioContext = new AudioContext();

    fetch(audioUrl)
      .then(response => response.arrayBuffer())
      .then(buffer => {
        audioContext.decodeAudioData(buffer, decodedData => {
          const sampleRate = audioContext.sampleRate;

          // Create a new buffer for the trimmed audio
          const trimmedBuffer = audioContext.createBuffer(
            decodedData.numberOfChannels,
            (endTime - startTime) * sampleRate,
            sampleRate
          );

          // Copy audio data from startTime to endTime
          for (let channel = 0; channel < decodedData.numberOfChannels; channel++) {
            const originalChannelData = decodedData.getChannelData(channel);
            const trimmedChannelData = trimmedBuffer.getChannelData(channel);

            trimmedChannelData.set(
              originalChannelData.slice(startTime * sampleRate, endTime * sampleRate),
              0
            );
          }

          // Convert the trimmed audio buffer to WAV format
          const wavBlob = audioBufferToWav(trimmedBuffer);
          const wavBlobUrl = URL.createObjectURL(wavBlob);
          setCutBlobUrl(wavBlobUrl);

          // Load the trimmed audio into the cut WaveSurfer
          if (cutWavesurferRef.current) {
            cutWavesurferRef.current.load(wavBlobUrl);
          }

          setIsCutting(false);
        });
      })
      .catch((error) => {
        console.error('Error cutting audio:', error);
        setIsCutting(false);
      });
  };

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = (audioBuffer) => {
    const buffer = audioBuffer.getChannelData(0);
    const wavData = new DataView(new ArrayBuffer(44 + buffer.length * 2));

    // RIFF header
    wavData.setUint8(0, 82); // R
    wavData.setUint8(1, 73); // I
    wavData.setUint8(2, 70); // F
    wavData.setUint8(3, 70); // F
    wavData.setUint32(4, 36 + buffer.length * 2, true); // Chunk size
    wavData.setUint8(8, 87); // W
    wavData.setUint8(9, 65); // A
    wavData.setUint8(10, 86); // V
    wavData.setUint8(11, 69); // E
    wavData.setUint8(12, 102); // f
    wavData.setUint8(13, 109); // m
    wavData.setUint8(14, 116); // t
    wavData.setUint8(15, 32); // 32 (format chunk size)

    wavData.setUint16(20, 1, true); // PCM format
    wavData.setUint16(22, 1, true); // Number of channels
    wavData.setUint32(24, audioBuffer.sampleRate, true); // Sample rate
    wavData.setUint32(28, audioBuffer.sampleRate * 2, true); // Byte rate
    wavData.setUint16(32, 2, true); // Block align
    wavData.setUint16(34, 16, true); // Bits per sample

    wavData.setUint8(36, 100); // d
    wavData.setUint8(37, 97); // a
    wavData.setUint8(38, 116); // t
    wavData.setUint8(39, 97); // a
    wavData.setUint32(40, buffer.length * 2, true); // Subchunk2 size

    // Write audio data
    for (let i = 0; i < buffer.length; i++) {
      wavData.setInt16(44 + i * 2, buffer[i] * 32767, true); // PCM data
    }

    return new Blob([wavData], { type: 'audio/wav' });
  };

  // Download the trimmed WAV audio
  const downloadCutAudio = () => {
    if (cutBlobUrl) {
      const a = document.createElement('a');
      a.href = cutBlobUrl;
      a.download = 'cut-audio.wav';
      a.click();
    }
  };

  // Handle dragging for the selectors
  const handleSelectorDrag = (e, selectorType) => {
    const waveform = document.getElementById('waveform');
    const waveformWidth = waveform.offsetWidth;
    const mouseX = e.clientX - waveform.getBoundingClientRect().left;
    let newTime = Math.max(0, (mouseX / waveformWidth) * duration);
    
    if (selectorType === 'start') {
      setStartSelectorPosition(newTime);
      setStartTime(newTime);
    } else {
      setEndSelectorPosition(newTime);
      setEndTime(newTime);
    }
  };

  return (
    <div className="audio">
      <div id="waveform" style={{ position: 'relative', height: '200px' }}>
        {/* Start and End Time selectors */}
        <div
          className="selector start-selector"
          style={{ left: `${(startSelectorPosition / duration) * 100}%`, zIndex: 10 }}
          onMouseDown={(e) => {
            const onMouseMove = (moveEvent) => handleSelectorDrag(moveEvent, 'start');
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', () => {
              document.removeEventListener('mousemove', onMouseMove);
            });
          }}
        ></div>
        <div
          className="selector end-selector"
          style={{ left: `${(endSelectorPosition / duration) * 100}%`, zIndex: 10 }}
          onMouseDown={(e) => {
            const onMouseMove = (moveEvent) => handleSelectorDrag(moveEvent, 'end');
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', () => {
              document.removeEventListener('mousemove', onMouseMove);
            });
          }}
        ></div>
      </div>

      <div>
        <Button onClick={togglePlayPause}>{isPlaying ? 'Pause' : 'Play'}</Button>
      </div>

      <div>
        <Button onClick={cutAudio} disabled={isCutting}>
          {isCutting ? 'Cutting...' : 'Cut Audio'}
        </Button>
        {cutBlobUrl && (
          <Button onClick={downloadCutAudio}>Download Cut Audio</Button>
        )}
      </div>

      <div id="cutWaveform"></div>
    </div>
  );
};

export default AudioCutter;
