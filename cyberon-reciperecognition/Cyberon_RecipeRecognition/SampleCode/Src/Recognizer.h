#ifndef _RECOGNIZER_H_
#define _RECOGNIZER_H_

#include "base_types.h"

//Error code
#define __RECOGNIZER_SUCCESS__ (0)
#define __RECOGNIZER_ERR_NO_MEMORY__ (-1)
#define __RECOGNIZER_ERR_INIT_SDK__ (-2)
#define __RECOGNIZER_ERR_OPEN_FILE__ (-3)
#define __RECOGNIZER_ERR_FILE_FROMAT__ (-4)
#define __RECOGNIZER_ERR_ADD_COMMAND__ (-5)
#define __RECOGNIZER_ERR_WRONG_PARAM__ (-6)
#define __RECOGNIZER_ERR_CREATE_THREAD__ (-7)
#define __RECOGNIZER_ERR_NO_RESULT__ (-8)

//Callback flag
#define _RECOGNIZER_CB_FLAG_RECOGNITON_START_ (1)
#define _RECOGNIZER_CB_FLAG_RECOGNITON_AWAKE_ (2)
#define _RECOGNIZER_CB_FLAG_RECOGNITON_RESULT_ (3)
#define _RECOGNIZER_CB_FLAG_RECOGNITON_END_ (4)
#define _RECOGNIZER_CB_FLAG_RECOGNITON_TIMEOUT_ (5)

#define TRIGGERMODE (0)
#define COMMANDMODE (1)

#define _MAX_BUF_LEN_ (256)
typedef struct _RecognitionResult
{
    CHAR pchzSingleCmd[_MAX_BUF_LEN_];
    LONG lSingCmdID;
    CHAR pchzPreCmd[_MAX_BUF_LEN_];
    LONG lPreCmdID;
    CHAR pchzCentralCmd[_MAX_BUF_LEN_];
    LONG lCentralCmdID;
    CHAR pchzPostCmd[_MAX_BUF_LEN_];
    LONG lPostCmdId;
    BYTE pbyResult[_MAX_BUF_LEN_];
	INT nCmdIdx;
    INT nWordDura;
    INT nEndSilDura;
    INT nNetworkLatency;
	INT nConfi;
    INT nSGDiff;
    INT nFIL;
    WORD wScore;
} RecognitionResult;

//Callback
typedef INT (*RecognizerCallback)(INT nFlag, RecognitionResult *poResult, INT nResNum);

HANDLE Recognizer_Init(CHAR *pchLibPath, CHAR *pchDataPath, CHAR *pchDSpotterLicenseFile, CHAR *pchDListenerLicenseFile, CHAR *pchServerFile, INT nLangID, INT *pnErr);

INT Recognizer_ReloadCommandFromFile(HANDLE hRecognizer, const CHAR *filename);

INT Recognizer_AddCommand(HANDLE hRecognizer, INT nCommandID, const CHAR *lpszCommandString);

INT Recognizer_DeleteCommand(HANDLE hRecognizer, const CHAR *lpszCommandString);

INT Recognizer_DeleteAllCommand(HANDLE hRecognizer);

INT Recognizer_ShowCommandList(HANDLE hRecognizer);

INT Recognizer_Start(HANDLE hRecognizer, RecognizerCallback lpfnCallback, BOOL bSaveRecordData);

INT Recognizer_Stop(HANDLE hRecognizer);

BOOL Recognizer_IsRecognizing(HANDLE hRecognizer);

INT Recognizer_WriteCommandToFile(HANDLE hRecognizer, const CHAR *filename);

INT Recognizer_Release(HANDLE hRecognizer);

INT  Recognizer_ShowTrigger(HANDLE hRecognizer);

INT Recognizer_CurrentMode(HANDLE hRecognizer);

#endif //_RECOGNIZER_H_