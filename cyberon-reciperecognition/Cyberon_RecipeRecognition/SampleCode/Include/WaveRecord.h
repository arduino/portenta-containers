#ifndef __WAVE_RECORD_H__
#define __WAVE_RECORD_H__

#include "base_types.h"

#ifdef __cplusplus
extern "C"{
#endif

/************************************************************************/
// Error code                                                                     
/************************************************************************/
#define WR_ERROR_SUCCESS						 0
#define WR_ERROR_ALLOCATE_MEMORY				-1
#define WR_ERROR_DEVICE_BUSY					-2
#define WR_ERROR_CLOSE_DEVICE					-3
#define WR_ERROR_CREATE_THREAD					-4
#define WR_ERROR_PREPARE_HEADER					-5
#define WR_ERROR_ADD_BUFFER						-6
#define WR_ERROR_START_RECORD					-7
#define WR_ERROR_BUFFER_EMPTY					-8
#define WR_ERROR_PARAMETER						-9
#define WR_ERROR_PROCESS_DELAY					-10
#define WR_ERROR_NOT_INIT						-11
#define WR_ERROR_NO_DATA						-12
#define WR_ERROR_TIMEOUT						-13
#define WR_ERROR_OPEN_DEVICE					-14
#define WR_ERROR_SET_ACCESS						-15
#define WR_ERROR_SET_FORMAT						-16
#define WR_ERROR_SET_CHANNEL					-17
#define WR_ERROR_SET_SAMPLERATE					-18
#define WR_ERROR_SET_FRAMESIZE					-19
#define WR_ERROR_SET_HW_PARAM					-20
#define WR_ERROR_RECORD_NOT_START				-21
#define WR_ERROR_STOP_RECORD					-22
#define WR_ERROR_FORMAT_CONVERT_NOT_SUPPORT		-23



/************************************************************************/
// API Prototype                                                                    
/************************************************************************/
HANDLE WaveRecordInitialize(char* pchAsoundLibFile, int nChannelNum, int nBitsPerSample, int nSampleRate, int nMaxRecordTime, int* pnErr);
// Description : Initialize a wave record object.
// Parameter :
//		pchAsoundLibFile(IN): The path of asound library file. If assign it to NULL, will load asound library by "libasound.so";
//		nChannelNum(IN) : 1 or 2.
//		nBitsPerSample(IN) : 8 or 16.
//		nSampleRate(IN) : 8000, 16000, 11025, 22050, 44100.
//		nMaxRecordTime(IN) : The max recoding time in ms. -1 for no limit.
//		pnErr(OUT) : WR_ERROR_SUCCESS or error code
// Return :
//		If succeed, return the handle;
//		Otherwise return NULL.

void WaveRecordRelease(HANDLE hWaveRecord);
// Description : Release a wave record object.
// Parameter :
//		hWaveRecord(IN) : The handle of record object.

int WaveRecordStart(HANDLE hWaveRecord, char* pchDeviceName, int nCardIndex, int nDeviceIndex);
// Description : Start the record object.
// Parameter :
//      pchDeviceName(IN): PCM device name. If it isn't NULL, it will be used to open device, else use CardIndex and DeviceIndex to open device.
//		hWaveRecord(IN) : The handle of record object.
//		nCardIndex(IN) : The index of sound card. It is 0 based.
//		nDeviceIndex(IN): The index of device on above sound card. It is 0 based.
// Return :
//		If succeed, return WR_ERROR_SUCCESS;
//		Otherwise return negative value.
// Remark :
//		If nCardIndex or nDeviceIndex is set to negative value, this API will use default name to open device.

int WaveRecordStop(HANDLE hWaveRecord);
// Description : Stop the record object.
// Parameter :
//		hWaveRecord(IN) : The handle of record object.
// Return :
//		If succeed, return WR_ERROR_SUCCESS;
//		Otherwise return negative value.

HANDLE WaveRecordGetDeviceHandle(HANDLE hWaveRecord);
// Description : Get the handle of wave in device of the record object.
// Parameter :
//		hWaveRecord (IN) : The handle of record object.
// Return :
//		If succeed, return the handle of wave in device;
//		Otherwise return NULL.

int WaveRecordGetWave(HANDLE hWaveRecord, BYTE* lpbyBuffer, int nNumByte);
// Description : Copy record data to buffer.
// Parameter :
//		hWaveRecord(IN) : The handle of record object.
//		lpbyBuffer(OUT) : The buffer that receive record data.
//		nNumByte(IN)	: The size of above buffer. It must be got from WaveRecordGetWaveBufferSize(...) API.
// Return :
//		If succeed, return got byte number of record data.
//		Otherwise return negative value.

int WaveRecordGetWaveBufferSize(HANDLE hWaveRecord);
// Description : Get the size of every record frame.
// Parameter :
//		hWaveRecord(IN) : The handle of record object.
// Return :
//		If succeed, return the size of every record frame;
//		Otherwise return negative value.
// Remark :¡@This API must be called after call WaveRecordStart(...).

int WaveRecordGetSamplePerBuffer(HANDLE hWaveRecord);
// Description : Get the sample number of every record frame.
// Parameter :
//		hWaveRecord(IN) : The handle of record object.
// Return :
//		If succeed, return the sample number of every record frame;
//		Otherwise return negative value.
// Remark :¡@This API must be called after call WaveRecordStart(...).

void WaveRecordRestartTimeout(HANDLE hWaveRecord, int nTimeout);
// Description : Restart timeout
// Parameter :
//		hWaveRecord(IN) : The handle of record object.
//		nTimeout(IN) : The new timeout value.


int WaveRecordGet16bitMono16kWave(HANDLE hWaveRecord, BYTE* lpbyBuffer, int nNumByte);
// Description : Copy record data to buffer.
// Parameter :
//		hWaveRecord(IN) : The handle of record object.
//		lpbyBuffer(OUT) : The buffer that receive record data.
//		nNumByte(IN)	: The size of above buffer. It must be got from WaveRecordGet16bitMono16kWaveBufferSize(...) API.
// Return :
//		If succeed, return got byte number of record data.
//		Otherwise return negative value.
//Remark : 
//		If the parameters of call WaveRecordInitialize(...) is different with 16bit/Mono/16k, it will do format convert.
//      **Currently only support that convert 16bit/Stereo/48k to 16bit/Mono/16k

int WaveRecordGet16bitMono16kWaveBufferSize(HANDLE hWaveRecord);
// Description : Get the size of every record frame.
// Parameter :
//		hWaveRecord(IN) : The handle of record object.
// Return :
//		If succeed, return the size of every record frame;
//		Otherwise return negative value.
// Remark :¡@This API must be called after call WaveRecordStart(...).



#ifdef __cplusplus
}
#endif


#endif //__WAVE_RECORD_H__
