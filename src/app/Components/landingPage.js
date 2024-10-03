"use client";
import React from 'react'
import { useState,useRef } from 'react';
import { Button , Center, Box,Divider,Stack,Text,FileInput,Blockquote,Space} from '@mantine/core'
import { Container } from '@mantine/core';
import '../CSS/allCSS.css'
import { IconLock } from '@tabler/icons-react';
import { IconAlignJustified } from '@tabler/icons-react';
import { Link } from "react-scroll";
import AudioCutter from './AudioCutter';

const LandingPage = () => {
    const [value, setValue] = useState(null);
    const inputRef = useRef(null);

  const handleButtonClick = () => {
    // Trigger the hidden file input
    inputRef.current.click();
  };

  const handleFileChange = (event) => {
    // Get the selected file from the input
    const file = event.target.files[0];
    setValue(file);
  };
  return (
    <Box style={{
        backgroundColor: '#17171E',
      }}>
        
        <Box className='navBar' style={{width: '100vw', display: 'flex',
        position:'absolute',
        justifyContent: 'start',
        paddingLeft:'20px',
        alignItems: 'center',
        backgroundColor:'#17171E',
        height:'60px',
        perspective:'on',
        zIndex:'2',
        paddingTop:'10px',
        paddingLeft:'20px',
        }}>
            <IconAlignJustified stroke={1} size='40px' />
        </Box>

        {!value && 
            
            <>
                <Box style={{
                    width: '100vw',
                    height: '100vh', display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>


                    <Box className='navBar' style={{
                        width: '100vw', display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        perspective: 'on',
                        zIndex: '2',
                        height: '50px'
                    }}>
                        <Link to="ts1" smooth={true} duration={1000}>
                            <Text size="sm" fw={700} tt="uppercase">how it works</Text>
                        </Link>

                        <Text size="sm" fw={700} tt="uppercase">joiner</Text>
                    </Box>

                    <Box className='centerContent'>
                        <Text size='43px' fw={700}> Audio Cutter </Text>
                        <Text size="24px" c={'gray'}>Free editor to trim and cut any audio file online</Text>

                        <Center style={{ height: '100%' }}>
                            <Stack>
                                {/* Hidden file input */}
                                <input
                                    ref={inputRef}
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                    accept="audio/*" />

                                {/* Button that acts as the file input */}
                                <Button
                                    variant="outline"
                                    color="violet"
                                    size="md"
                                    radius="xl"
                                    onClick={handleButtonClick} // Trigger input on button click
                                    className='button'
                                    style={{ color: 'whitesmoke', borderWidth: '2px', fontsize: '30px', }}
                                >
                                    {value ? value.name : "Browse my files"}
                                </Button>
                            </Stack>
                        </Center>


                    </Box>

                </Box><Divider my='sm' style={{ width: '100%', marginBottom: '100px' }} color='dark' /><Box className='footerContent'>
                        <Box id="ts1">
                            <Text size='32px'>How to cut audio</Text>
                        </Box>
                        <Blockquote color="violet" mt="30px" style={{ width: ' 100%', paddingTop: '15px' }}>
                            <Text size='23px' style={{ wordSpacing: '0.1em', lineHeight: '35px' }}>This app can be used to trim and/or cut audio tracks, remove an audio fragments. Fade in and fade out your music easily to make the audio harmoniously.</Text>
                            <Space h="xl" />
                            <Text size='23px' style={{ wordSpacing: '0.1em', lineHeight: '35px' }}>It fast and easy to use. You can save the audio file in any format (codec parameters are configured)</Text>
                            <Space h="xl" />
                            <Text size='23px' style={{ wordSpacing: '0.1em', lineHeight: '35px' }}>It works directly in the browser, no needs to install any software, is available for mobile devices.</Text>
                        </Blockquote>
                        <Box style={{ display: 'flex', gap: '5px', marginTop: '40px' }}>
                            <IconLock stroke={2} size='30px' />
                            <Text size='25px'>Privacy and Security Guaranteed</Text>
                        </Box>
                        <Blockquote color="violet" mt="30px" style={{ width: ' 100%', paddingTop: '15px', paddingBottom: '15px' }}>
                            <Text size='23px' style={{ wordSpacing: '0.1em', lineHeight: '35px' }}>This is serverless app. Your files does not leave your device</Text>
                        </Blockquote>
                        <Space h="70px" />

                    </Box>
            </>
        }

        {value && <AudioCutter audioFile={value}/>}

    </Box>
  )
}

export default LandingPage;
