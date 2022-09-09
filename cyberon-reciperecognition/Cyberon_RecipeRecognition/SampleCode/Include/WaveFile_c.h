#ifndef _WaveFile_c_H_
#define _WaveFile_c_H_

#include "base_types.h"
#include <stdio.h>

#define WaveFile_SUCCESS				0

#define WaveFile_OPEN_ERROR				-5600 //opening wave file error.
#define WaveFile_HEADER_ERROR			-5601 //wave type not found.
#define WaveFile_FORMAT_ERROR			-5602 //wave format not found.
#define WaveFile_DATA_ERROR				-5603 //data chunk error (not found).
#define WaveFile_SEEK_ERROR				-5604
#define WaveFile_READ_ERROR				-5605
#define WaveFile_NOFILE_ERROR			-5606 //no file is opened or created.
#define WaveFile_CREATE_ERROR			-5607
#define WaveFile_WRITE_ERROR			-5608
#define WaveFile_FLUSH_ERROR			-5609
#define WaveFile_NO_MEMORY_ERROR		-5610
#define WaveFile_MODE_ERROR				-5611 //write for open or read for create
#define WaveFile_INVALID_PARAM_ERROR	-5612


#ifdef __cplusplus
extern "C"{
#endif

////

HANDLE WaveFile_Open(const char* pchFileName, INT* pnErr);


HANDLE WaveFile_Create(const char* pchFileName, INT nNumChannel, INT nBitsPerSample, INT nSampleRate, INT* pnErr);


INT	WaveFile_Close(HANDLE hWaveFile);


////
INT WaveFile_GetDataSizeInByte(HANDLE hWaveFile, UINT *pnSize);

INT WaveFile_GetFormat(HANDLE hWaveFile, INT* pnChannel, INT* pnBit, INT *pnSampleRate);

////
INT WaveFile_Read(HANDLE hWaveFile, const BYTE * Buffer, const UINT nSizeInByte);

INT WaveFile_Write(HANDLE hWaveFile, const BYTE *lpbyBuffer, const UINT nSizeInByte);


#ifdef __cplusplus
}
#endif


#endif //_WaveFile_c_H_



