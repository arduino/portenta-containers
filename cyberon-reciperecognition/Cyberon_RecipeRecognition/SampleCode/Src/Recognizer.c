#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <pthread.h>
#include <ctype.h>
#include <time.h>

//For SDK
#include "base_types.h"
#include "DListener.h"
#include "DListener_Const.h"
#include "DSpotterApi.h"
#include "DSpotterApi_Const.h"

//For audio
#include "WaveRecord.h"
#include "WaveFile_c.h"
#include "MyLinkList.h"

#include "Recognizer.h"

/************************************************************************/
//Macro
/************************************************************************/
// Maximal number for get voice recognition result
#define _MAX_NBEST_ 5

//Timeout
#define _TIMEOUT_LENGTH_ (10000) //millisecond

#define _MAX_LINE_LEN_ (1024)

// Command statring ID with every command set
#define _SINGLE_CMD_START_ID_ (0)
#define _PRE_CMD_START_ID_ (2000)
#define _POST_CMD_START_ID_ (4000)
#define _CENTRAL_CMD_START_ID_ (6000)
#define DSPOTTER_CMD_PACK_BUN "./data/Castelmac_trigger_pack_withTxt.bin"

typedef struct _WAVEDATA
{
    CHAR *m_lpbySamples;
    INT m_nSize;
} WAVEDATA;

typedef struct _Recognizer
{
    //Dlistener SDK
    HANDLE m_hDListener;
    //HANDLE m_hWaveToFea;
    HANDLE m_hDSpotter;
    //For thread
    pthread_t m_hRecogThread;
    pthread_t m_hRecordThread;
    pthread_mutex_t m_hMutex;
    BOOL m_bStop;

    //For link list
    HANDLE m_hDataList;

    //
    RecognizerCallback m_lpfnCallback;
    BOOL m_bSaveRecordData;
    INT m_nCurrentMode;
} Recognizeer;

typedef struct tm SYSTEMTIME;

/************************************************************************/
//global variable
/************************************************************************/
//For audio device on NXP
static const CHAR* g_lpcLibPath = "/usr/lib/libasound.so.2.0.0";
static INT g_nAudioCardIndex = 2;//-1
static INT g_nAudioDeviceIndex = 0;//-1

//For audio device on x86
// static const CHAR* g_lpcLibPath = NULL;
// static INT g_nAudioCardIndex = 1;//-1
// static INT g_nAudioDeviceIndex = 0;//-1

//Recording parameters
static const INT g_nBit = 16;
static const INT g_nChannel = 1;
static const INT g_nSampleRate = 16000;

static VOID GetLocalTime(SYSTEMTIME *st)
{
    struct tm *pst = NULL;
    time_t t = time(NULL);
    pst = localtime(&t);
    memcpy(st, pst, sizeof(SYSTEMTIME));
    st->tm_year += 1900;
}

/************************************************************************/
//Local Functions
/************************************************************************/
//audio recording
static INT StartRecord(Recognizeer *poRecognizer, INT nBit, INT nChannel, INT nSampleRate)
{
    INT nRes, nBufSize, nRecSize, nDim, nFeaSize;
    SHORT *psBuffer = NULL;
    //for audio record
    HANDLE hWaveRecord = NULL;
    INT nSize, nMaxBufferSize;
    WAVEDATA *pWaveData = NULL;
    HANDLE hWaveToFeaSDK = NULL;
    CHAR *pbyFeaData = NULL;
    //For save record data
    HANDLE hWaveFile = NULL;
    SYSTEMTIME oSystemTime;
    CHAR pchzRecordFile[_MAX_BUF_LEN_];
    INT nCount;
    printf("Recording starts\n");

    //Initialize WaveRecord
    hWaveRecord = WaveRecordInitialize(g_lpcLibPath, nChannel, nBit, nSampleRate, -1, &nRes); //10 sec
    if (!hWaveRecord)
    {
        printf("StartRecord:: Fail to initialize WaveRecord!<%d>\n", nRes);
        return -1;
    }
    //Start WaveRecord
    nRes = WaveRecordStart(hWaveRecord, NULL, g_nAudioCardIndex, g_nAudioDeviceIndex);
    if (nRes < 0)
    {
        printf("StartRecord:: Fail to start WaveRecord!<%d>\n", nRes);
        WaveRecordRelease(hWaveRecord);
        return -2;
    }
    //Allocate buffer for get record data
    nBufSize = WaveRecordGetWaveBufferSize(hWaveRecord);
    psBuffer = (SHORT *)malloc(nBufSize);
    if (psBuffer == NULL)
    {
        printf("StartRecord:: Fail to malloc buffer for read record data!\n");
        WaveRecordRelease(hWaveRecord);
        return -3;
    }

    if (poRecognizer->m_bSaveRecordData)
    {
        GetLocalTime(&oSystemTime);
        sprintf(pchzRecordFile, "./Record_%04d_%02d_%02d_%02d_%02d_%02d.wav", oSystemTime.tm_year, oSystemTime.tm_mon + 1, oSystemTime.tm_mday, oSystemTime.tm_hour, oSystemTime.tm_min, oSystemTime.tm_sec);
        hWaveFile = WaveFile_Create(pchzRecordFile, nChannel, nBit, nSampleRate, &nRes);
        if (hWaveFile == NULL)
            printf("StartRecord:: Fail to open <%s>!\n", pchzRecordFile);
    }

    nMaxBufferSize = (nChannel * nSampleRate * _TIMEOUT_LENGTH_ * (nBit / 8)) / 1000;
    nRecSize = 0;
    
    while (TRUE)
    {
        //Get record data
        nSize = WaveRecordGetWave(hWaveRecord, (BYTE *)psBuffer, nBufSize);
        if (nSize <= 0)
        {
            printf("StartRecord:: Fail to get recording data! %d\n", nSize);
            break;
        }
        if (poRecognizer->m_bSaveRecordData && hWaveFile != NULL)
            WaveFile_Write(hWaveFile, (BYTE *)psBuffer, nSize);
        //Copy data to link list
        WAVEDATA *pWaveData = (WAVEDATA *)malloc(sizeof(WAVEDATA));
        if (pWaveData == NULL)
        {
            printf("StartRecord:: Fail to allocate memory for pWaveData!\n");
            break;
        }
        pWaveData->m_lpbySamples = (CHAR *)malloc(nSize * sizeof(CHAR));
        if (pWaveData->m_lpbySamples == NULL)
        {
            free(pWaveData);
            printf("StartRecord:: Fail to allocate memory for pWaveData->lpsData!\n");
            break;
        }
        pWaveData->m_nSize = nSize;
        memcpy(pWaveData->m_lpbySamples, psBuffer, nSize * sizeof(CHAR));

        //Add data to data list
        pthread_mutex_lock(&poRecognizer->m_hMutex);
        if ((nCount = PointerList_GetCount(poRecognizer->m_hDataList)) < 200)
        {
            PointerList_AddTail(poRecognizer->m_hDataList, pWaveData);
            pWaveData = NULL;
            pthread_mutex_unlock(&poRecognizer->m_hMutex);
        }
        else
        {
            pthread_mutex_unlock(&poRecognizer->m_hMutex);
            printf("Data loss\n");
            usleep(200);
        }
        nRecSize += nSize;
        if (poRecognizer->m_bStop==TRUE)
            break;
    }

    //Stop WaveRecord
    WaveRecordStop(hWaveRecord);

    //Release WaveRecord
    WaveRecordRelease(hWaveRecord);

    poRecognizer->m_bStop = TRUE;

    if (poRecognizer->m_bSaveRecordData && hWaveFile != NULL)
        WaveFile_Close(hWaveFile);

    free(psBuffer);
    printf("Recording end!\n");

    return 0;
}

static VOID *RecordThread(VOID *param)
{
    Recognizeer *poRecognizer = (Recognizeer *)param;

    StartRecord(poRecognizer, g_nBit, g_nChannel, g_nSampleRate);
    pthread_exit(0);
    return NULL;
}

static VOID *RecogThread(VOID *param)
{
    Recognizeer *poRecognizer = (Recognizeer *)param;
    HANDLE hDListener;
    HANDLE hDSpotter;
    WAVEDATA *pWaveData = NULL;
    INT nPreCmdLen, nCentralCmdLen, nPostCmdLen;
    WORD wScore;
    INT nResNum, i, nRes,nMode;
    RecognitionResult pozResult[_MAX_NBEST_];
	INT pnCmdIdx[1], pnWordDura[1], pnEndSilDura[1], pnNetworkLatency[1];
	INT pnConfi[1], pnSGDiff[1], pnFIL[1];
    //printf("RecogThread: Start\n");

    //Initialize variables
    hDListener = poRecognizer->m_hDListener;
    hDSpotter = poRecognizer->m_hDSpotter;

    //Start recognition
    DSpotterReset(hDSpotter);

    if ((nRes = DListener_StartRecognition(hDListener)) != DLISTENER_SUCCESS)
    {
        printf("Fail to start recognition <%d>!\n", nRes);
        goto ERROR_LEAVE;
    }       
    poRecognizer->m_lpfnCallback(_RECOGNIZER_CB_FLAG_RECOGNITON_START_, NULL, 0);
    nRes = DLISTENER_ERR_NEED_MORE_SAMPLE;
    //Do recognition
    poRecognizer->m_nCurrentMode=TRIGGERMODE;
    while(TRUE)
    {
        pthread_mutex_lock(&poRecognizer->m_hMutex);
        pWaveData = (WAVEDATA *)PointerList_RemoveHead(poRecognizer->m_hDataList);
        pthread_mutex_unlock(&poRecognizer->m_hMutex);
        if (pWaveData == NULL)
        {
            if (poRecognizer->m_bStop==TRUE)
                break;
            usleep(2000);
            continue;
        }
        if (poRecognizer->m_nCurrentMode == TRIGGERMODE)
        {
            nRes = DSpotterAddSample(hDSpotter, pWaveData->m_lpbySamples, pWaveData->m_nSize>>1);
            if (nRes == DLISTENER_SUCCESS)
            {
                DSpotterGetUTF8Result(hDSpotter, pnCmdIdx, pozResult[0].pbyResult, pnWordDura, pnEndSilDura, pnNetworkLatency, pnConfi, pnSGDiff, pnFIL);
                pozResult[0].nWordDura=pnWordDura[0];
                pozResult[0].nEndSilDura=pnEndSilDura[0];
                pozResult[0].nNetworkLatency=pnNetworkLatency[0];
                pozResult[0].nConfi=pnConfi[0];
                pozResult[0].nSGDiff=pnSGDiff[0];
                pozResult[0].nFIL=pnFIL[0];
                poRecognizer->m_lpfnCallback(_RECOGNIZER_CB_FLAG_RECOGNITON_AWAKE_, pozResult, 1);
                DSpotterReset(hDSpotter);
                poRecognizer->m_nCurrentMode=COMMANDMODE;
            }
        }
        else if (poRecognizer->m_nCurrentMode == COMMANDMODE)
        {
            nRes = DListener_AddSample(hDListener, pWaveData->m_lpbySamples, pWaveData->m_nSize>>1);
            if (nRes != DLISTENER_ERR_NEED_MORE_SAMPLE)
            {
                if (nRes == DLISTENER_SUCCESS)
                {
                    //Get recognition result
                    for (i = 0; i < _MAX_NBEST_; i++)
                    {
                        nPreCmdLen = _MAX_BUF_LEN_;
                        nCentralCmdLen = _MAX_BUF_LEN_;
                        nPostCmdLen = _MAX_BUF_LEN_;
                        pozResult[i].pchzSingleCmd[0] = 0;
                        pozResult[i].pchzPreCmd[0] = 0;
                        pozResult[i].pchzCentralCmd[0] = 0;
                        pozResult[i].pchzPostCmd[0] = 0;
                        pozResult[i].wScore = 0;
                        if (DListener_GetNBestResult_UTF8(hDListener, i, &pozResult[i].wScore, pozResult[i].pchzPreCmd, &nPreCmdLen, &pozResult[i].lPreCmdID,
                                                        pozResult[i].pchzCentralCmd, &nCentralCmdLen, &pozResult[i].lCentralCmdID,
                                                        pozResult[i].pchzPostCmd, &nPostCmdLen, &pozResult[i].lPostCmdId) != DLISTENER_SUCCESS)
                            break;
                        //Single Cmd
                        if (strlen(pozResult[i].pchzPreCmd) == 0)
                        {
                            strcpy(pozResult[i].pchzSingleCmd, pozResult[i].pchzCentralCmd);
                            pozResult[i].pchzCentralCmd[0] = 0;
                            pozResult[i].lSingCmdID = pozResult[i].lCentralCmdID;
                            pozResult[i].lCentralCmdID = 0;
                        }
                    }
                    nResNum = i;
                    poRecognizer->m_lpfnCallback(_RECOGNIZER_CB_FLAG_RECOGNITON_RESULT_, pozResult, nResNum);
                }
                else
                {
                    poRecognizer->m_lpfnCallback(_RECOGNIZER_CB_FLAG_RECOGNITON_TIMEOUT_, NULL, NULL);
                    poRecognizer->m_nCurrentMode=TRIGGERMODE;
                }
                if ((nRes = DListener_StartRecognition(hDListener)) != DLISTENER_SUCCESS)
                {
                    printf("Fail to start recognition <%d>!\n", nRes);
                    goto ERROR_LEAVE;
                }
            }
        }
        free(pWaveData->m_lpbySamples);
        free(pWaveData);
        if (poRecognizer->m_bStop==TRUE)
            break;
    } 
 
ERROR_LEAVE:
    //Stop record thread
    poRecognizer->m_bStop = TRUE;
    //Wait recording end
    //printf("RecogThread:: Before wait record thread, poRecognizer->m_bStop=%d!\n", poRecognizer->m_bStop);
    if (poRecognizer->m_hRecordThread != (pthread_t)NULL)
    {
        pthread_join(poRecognizer->m_hRecordThread, NULL);
        poRecognizer->m_hRecordThread = (pthread_t)NULL;
    }
    //printf("RecogThread:: After wait record thread!\n");

    //Delete all data in data list
    pthread_mutex_lock(&poRecognizer->m_hMutex);
    while (!PointerList_IsEmpty(poRecognizer->m_hDataList))
    {
        pWaveData = (WAVEDATA *)PointerList_RemoveHead(poRecognizer->m_hDataList);
        if (pWaveData != NULL)
        {
            free(pWaveData->m_lpbySamples);
            free(pWaveData);
        }
    }
    pthread_mutex_unlock(&poRecognizer->m_hMutex);

    //End
    poRecognizer->m_lpfnCallback(_RECOGNIZER_CB_FLAG_RECOGNITON_END_, NULL, 0);

    //printf("RecogThread: End\n");

    pthread_exit(0);
    return NULL;
}

static INT LoadCommandsFromFile(HANDLE hDListener, CHAR *lpszCommandFile)
{
    CHAR lpchzLine[_MAX_LINE_LEN_], *pchToken, lpchzSeps[] = ",\r\n";
    BYTE lpchzFileHeader[3];
    FILE *fp;
    INT nCommandID, nCnt = 0, i;
    //Open file
    if ((fp = fopen(lpszCommandFile, "rb")) == NULL)
    {
        printf("Fail to open <%s>!\n", lpszCommandFile);
        return __RECOGNIZER_ERR_OPEN_FILE__;
    }

    //Read file
    fread(lpchzFileHeader, sizeof(BYTE), 3, fp);
    if (lpchzFileHeader[0] != 0xEF || lpchzFileHeader[1] != 0xBB || lpchzFileHeader[2] != 0xBF) //UTF8 header
    {
        fclose(fp);
        printf("Error: <%s> is not an UTF8 file!\n", lpszCommandFile);
        return __RECOGNIZER_ERR_FILE_FROMAT__;
    }
    
    while (fgets(lpchzLine, _MAX_LINE_LEN_, fp) != NULL)
    {
        //Remove \r\n
        //printf("Command : %s\n", lpchzLine);
        pchToken = strtok(lpchzLine, lpchzSeps);
        if (pchToken == NULL)
            continue;
        nCommandID = atoi(pchToken);
        //printf("nCommandID : %d\n", nCommandID);
        pchToken = strtok(NULL, lpchzSeps);
        if (pchToken == NULL)
            continue;
        //printf("pchToken : %s\n", pchToken);
        if (strlen(pchToken) > 0) //add commands
        {
            DListener_AddCommand_UTF8(hDListener, pchToken, FALSE, nCommandID, DLISTENER_CA_SINGLE_CMD);
            nCnt++;
        }
    }//while(fgets(lpchzLine, _MAX_LINE_LEN_, fp) != NULL)
    fclose(fp);
    //Judge result of add commands
    i = 0;
    i += DListener_GetNumCommand(hDListener, DLISTENER_CA_SINGLE_CMD);
    if (nCnt != i)
        printf("Command count[%d] != added command number[%d]!\n", nCnt, i);

    return nCnt;
}

static INT WriteCommandToFile(HANDLE hDListener, CHAR *lpszCommandFile)
{
    CHAR lpchCmdNameBuf[_MAX_LINE_LEN_], *pchToken, lpchzSeps[] = "\r\n", lpchzComa[] = ",";
    CHAR lpchzLine[_MAX_LINE_LEN_];
    BYTE lpchzFileHeader[3]={0xEF,0xBB,0xBF};
    FILE *fp;
    INT nCommandID, nCnt = 0, i,nLen;
    //Open file
    if ((fp = fopen(lpszCommandFile, "wb")) == NULL)
    {
        printf("Fail to open <%s>!\n", lpszCommandFile);
        return __RECOGNIZER_ERR_OPEN_FILE__;
    }
    //Write file bom header
    fwrite(lpchzFileHeader, sizeof(BYTE), 3, fp);

    //Write CmdFlag
    nCnt = DListener_GetNumCommand(hDListener, DLISTENER_CA_SINGLE_CMD);
    i=0;
    for (i=0;i<nCnt;i++)
    {
        nLen = _MAX_LINE_LEN_;
        nCommandID = -1;
        memset(lpchCmdNameBuf, 0, (_MAX_LINE_LEN_*sizeof(CHAR)));
        memset(lpchzLine, 0, (_MAX_LINE_LEN_*sizeof(CHAR)));
        if (DListener_GetCommandByIndex_UTF8(hDListener, i, lpchCmdNameBuf, &nLen, &nCommandID, DLISTENER_CA_SINGLE_CMD)==DLISTENER_SUCCESS)
        {
            sprintf(lpchzLine,"%d,%s\n",nCommandID,lpchCmdNameBuf);
            fwrite(lpchzLine, sizeof(CHAR), strlen(lpchzLine),fp);
        }
    }
    fclose(fp);
    return nCnt;
}

/************************************************************************/
//API
/************************************************************************/
HANDLE Recognizer_Init(CHAR *pchLibPath, CHAR *pchDataPath, CHAR *pchDSpoptterLicenseFile,  CHAR *pchDListenerLicenseFile, CHAR *pchServerFile, INT nLangID, INT *pnErr)
{
    Recognizeer *poRecognizer = NULL;
    const INT nSampleRate = 16000;
    INT pLangID[5]={0};
    INT i,n;

	BOOL *pbEnableGroup = NULL;
    CHAR pchDSpotterLicenseFullPath[_MAX_LINE_LEN_];
    CHAR pchDListenerLicenseFullPath[_MAX_LINE_LEN_];
    CHAR pchSeverFullPath[_MAX_LINE_LEN_];
    //Allocate memory
    poRecognizer = (Recognizeer *)malloc(sizeof(Recognizeer));
    if (poRecognizer == NULL)
    {
        if (pnErr != NULL)
            *pnErr = __RECOGNIZER_ERR_NO_MEMORY__;
        return NULL;
    }
    memset(poRecognizer, 0, sizeof(Recognizeer));
    memset(pchDSpotterLicenseFullPath, 0, _MAX_LINE_LEN_*sizeof(CHAR));
    memset(pchDListenerLicenseFullPath, 0, _MAX_LINE_LEN_*sizeof(CHAR));
    memset(pchSeverFullPath, 0,  _MAX_LINE_LEN_*sizeof(CHAR));
    if (pchDSpoptterLicenseFile!=NULL)
        sprintf(pchDSpotterLicenseFullPath,"%s/%s",pchDataPath,pchDSpoptterLicenseFile);
    if (pchDListenerLicenseFile!=NULL)
        sprintf(pchDListenerLicenseFullPath,"%s/%s",pchDataPath,pchDListenerLicenseFile);
    if (pchServerFile!=NULL)
        sprintf(pchSeverFullPath,"%s/%s",pchDataPath,pchServerFile);

    pbEnableGroup = (BOOL *)malloc(sizeof(BOOL) * 1);
    if(!pbEnableGroup)
    {
        printf("LoadCommandPackBin():: Leave no memory!\n");
        return NULL;
    }
    pbEnableGroup[0]=TRUE;

    printf("%s\n",pchDSpotterLicenseFullPath);
    poRecognizer->m_hDSpotter = DSpotterInitMultiWithPackBin(DSPOTTER_CMD_PACK_BUN, pbEnableGroup, 500, NULL, 0, pnErr, pchDSpotterLicenseFullPath, NULL);
    if (poRecognizer->m_hDSpotter == NULL)
    {
        free(poRecognizer);
        return NULL;
    }

    //Initialize DListener SDK
    poRecognizer->m_hDListener = DListener_Init(pchLibPath, pchDataPath, pchDListenerLicenseFullPath, pchSeverFullPath, nLangID, pnErr);
    if (poRecognizer->m_hDListener == NULL)
    {
        free(poRecognizer);
        return NULL;
    }
    DListener_SetRejectionLevel(poRecognizer->m_hDListener, 8);

    //Set timeout
    DListener_SetTimeout(poRecognizer->m_hDListener, _TIMEOUT_LENGTH_);

    //For link list
    poRecognizer->m_hDataList = PointerList_Init();

    //For thread
    pthread_mutex_init(&poRecognizer->m_hMutex, NULL);

    SAFE_FREE(pbEnableGroup);

    if (pnErr != NULL)
        *pnErr = __RECOGNIZER_SUCCESS__;

    return poRecognizer;
}

INT Recognizer_ReloadCommandFromFile(HANDLE hRecognizer, const CHAR *filename)
{
    INT nCnt;
    Recognizeer *poRecognizer = (Recognizeer *)hRecognizer;
    if (poRecognizer == NULL)
        return __RECOGNIZER_ERR_WRONG_PARAM__;

    Recognizer_DeleteAllCommand(hRecognizer);

    nCnt = LoadCommandsFromFile(poRecognizer->m_hDListener, filename);
    return 0;
}

INT Recognizer_AddCommand(HANDLE hRecognizer, INT nCommandID, const CHAR *lpszCommandString)
{
    INT i=0,nLen,nCmd,nCnt;
    CHAR lpchCmdNameBuf[_MAX_LINE_LEN_];
    Recognizeer *poRecognizer = (Recognizeer *)hRecognizer;
    if (poRecognizer == NULL)
        return __RECOGNIZER_ERR_WRONG_PARAM__;

    if (lpszCommandString!=NULL)
    {
        nCnt = DListener_GetNumCommand(poRecognizer->m_hDListener, DLISTENER_CA_SINGLE_CMD);
        i=0;
        for (i=0;i<nCnt;i++)
        {
            nLen = _MAX_LINE_LEN_;
            nCmd = -1;
            memset(lpchCmdNameBuf, 0, (_MAX_LINE_LEN_*sizeof(CHAR)));
            if (DListener_GetCommandByIndex_UTF8(poRecognizer->m_hDListener, i, lpchCmdNameBuf, &nLen, &nCmd, DLISTENER_CA_SINGLE_CMD)==DLISTENER_SUCCESS)
            {
                if (strcmp(lpchCmdNameBuf, lpszCommandString)==0)
                    return 0;
            }
            else
                return -1;
        }
        DListener_AddCommand_UTF8(poRecognizer->m_hDListener, lpszCommandString, FALSE, nCommandID, DLISTENER_CA_SINGLE_CMD);
    }
    return 0;
}

INT Recognizer_DeleteCommand(HANDLE hRecognizer, const CHAR *lpszCommandString)
{
    Recognizeer *poRecognizer = (Recognizeer *)hRecognizer;
    if (poRecognizer == NULL)
        return __RECOGNIZER_ERR_WRONG_PARAM__;

    if (lpszCommandString!=NULL){
        DListener_DelCommandByName_UTF8(poRecognizer->m_hDListener, lpszCommandString, DLISTENER_CA_SINGLE_CMD);
    }
    return 0;
}


INT Recognizer_ShowTrigger(HANDLE hRecognizer)
{
    HANDLE hDSpotter =NULL;
    Recognizeer *poRecognizer = (Recognizeer *)hRecognizer;
	INT nCmdNum, i, j;
	BYTE pbyBuf[_MAX_BUF_LEN_], pbyCommand[_MAX_BUF_LEN_];
	
    hDSpotter = poRecognizer->m_hDSpotter;
    nCmdNum = DSpotterGetCommandNumber(hDSpotter);
    pbyBuf[0] = 0;
    for(j = 0; j < nCmdNum; j++)
    {
        DSpotterGetUTF8Command(hDSpotter, j, pbyCommand);
        if(strcmp(pbyBuf, pbyCommand) != 0)	
        {	
            printf("%s\n", pbyCommand);
            strcpy(pbyBuf, pbyCommand);
        }
    }
    return 0;
}

INT Recognizer_ShowCommandList(HANDLE hRecognizer)
{
    CHAR lpchzLine[_MAX_LINE_LEN_];
    UNICODE lpwchzLine[_MAX_LINE_LEN_];
    INT nLen;
    INT nCnt;
    INT nCommandId;
    INT i;
    Recognizeer *poRecognizer = (Recognizeer *)hRecognizer;
    if (poRecognizer == NULL)
        return __RECOGNIZER_ERR_WRONG_PARAM__;

    nCnt = DListener_GetNumCommand(poRecognizer->m_hDListener, DLISTENER_CA_SINGLE_CMD);
    i=0;
    while(i<nCnt)
    {
        nLen = _MAX_LINE_LEN_;
        nCommandId=-1;
        memset(lpchzLine,0,sizeof(CHAR)*_MAX_LINE_LEN_);
        memset(lpwchzLine,0,sizeof(UNICODE)*_MAX_LINE_LEN_);
        if (DListener_GetCommandByIndex_UTF8(poRecognizer->m_hDListener, i, lpchzLine, &nLen, &nCommandId, DLISTENER_CA_SINGLE_CMD)==DLISTENER_SUCCESS)
        {
            printf("(%d,%s)\n", nCommandId, lpchzLine);
        }
        else
        {
            return -1;
        }
        i++;
    }
    return 0;
}

INT Recognizer_Start(HANDLE hRecognizer, RecognizerCallback lpfnCallback, BOOL bSaveRecordData)
{
    Recognizeer *poRecognizer = (Recognizeer *)hRecognizer;
    if (poRecognizer == NULL || lpfnCallback == NULL)
        return __RECOGNIZER_ERR_WRONG_PARAM__;

    poRecognizer->m_lpfnCallback = lpfnCallback;
    poRecognizer->m_bSaveRecordData = bSaveRecordData;
    poRecognizer->m_bStop = FALSE;
    poRecognizer->m_nCurrentMode=TRIGGERMODE;

    //Start record and recognize thread
    pthread_create(&poRecognizer->m_hRecogThread, NULL, &RecogThread, (LPVOID)poRecognizer);
    pthread_create(&poRecognizer->m_hRecordThread, NULL, &RecordThread, (LPVOID)poRecognizer);
    if (poRecognizer->m_hRecogThread == (pthread_t)NULL || poRecognizer->m_hRecordThread == (pthread_t)NULL)
    {
        Recognizer_Stop(hRecognizer);
        return __RECOGNIZER_ERR_CREATE_THREAD__;
    }

    return __RECOGNIZER_SUCCESS__;
}

INT Recognizer_Stop(HANDLE hRecognizer)
{
    Recognizeer *poRecognizer = (Recognizeer *)hRecognizer;
    if (poRecognizer == NULL)
        return __RECOGNIZER_ERR_WRONG_PARAM__;
    //printf("trigger break\n");
    poRecognizer->m_bStop = TRUE;
    //printf("wait m_hRecogThread end\n");
    if (poRecognizer->m_hRecogThread != (pthread_t)NULL)
    {
        pthread_join(poRecognizer->m_hRecogThread, NULL);
        poRecognizer->m_hRecogThread = (pthread_t)NULL;
    }

    //printf("wait m_hRecordThread end\n");
    if (poRecognizer->m_hRecordThread != (pthread_t)NULL)
    {
        pthread_join(poRecognizer->m_hRecordThread, NULL);
        poRecognizer->m_hRecordThread = (pthread_t)NULL;
    }

    return __RECOGNIZER_SUCCESS__;
}

BOOL Recognizer_IsRecognizing(HANDLE hRecognizer)
{
    INT nRes;
    Recognizeer *poRecognizer = (Recognizeer *)hRecognizer;

    if (poRecognizer == NULL)
        return __RECOGNIZER_ERR_WRONG_PARAM__;

    if (poRecognizer->m_hRecogThread == (pthread_t)NULL)
        return FALSE;

    nRes = pthread_kill(poRecognizer->m_hRecogThread, 0);
    if (nRes == 0)
        return TRUE;
    else
        return FALSE;
}

INT Recognizer_WriteCommandToFile(HANDLE hRecognizer, const CHAR *filename)
{
    INT nCnt;
    Recognizeer *poRecognizer = (Recognizeer *)hRecognizer;
    if (poRecognizer == NULL)
        return __RECOGNIZER_ERR_WRONG_PARAM__;

    nCnt = WriteCommandToFile(poRecognizer->m_hDListener, filename);
    return 0;
}

INT Recognizer_Release(HANDLE hRecognizer)
{
    Recognizeer *poRecognizer = (Recognizeer *)hRecognizer;
    if (poRecognizer == NULL)
        return __RECOGNIZER_ERR_WRONG_PARAM__;

    //Stop threads
    Recognizer_Stop(hRecognizer);

    //Release resources
    pthread_mutex_destroy(&poRecognizer->m_hMutex);
    PointerList_Release(poRecognizer->m_hDataList);
    DSpotterRelease(poRecognizer->m_hDSpotter);
    DListener_Release(poRecognizer->m_hDListener);
    free(poRecognizer);

    return __RECOGNIZER_SUCCESS__;
}

INT Recognizer_DeleteAllCommand(HANDLE hRecognizer)
{
    Recognizeer *poRecognizer = (Recognizeer *)hRecognizer;
    if (poRecognizer == NULL)
        return __RECOGNIZER_ERR_WRONG_PARAM__;

    return DListener_RemoveAllCommand(poRecognizer->m_hDListener, DLISTENER_CA_SINGLE_CMD);
}

INT Recognizer_CurrentMode(HANDLE hRecognizer)
{
    Recognizeer *poRecognizer = (Recognizeer *)hRecognizer;
    if (poRecognizer == NULL)
        return __RECOGNIZER_ERR_WRONG_PARAM__;

    return poRecognizer->m_nCurrentMode;
}
