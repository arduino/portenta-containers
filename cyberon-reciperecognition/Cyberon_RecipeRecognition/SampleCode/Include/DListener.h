///////////////////////////////////////////////////////////
//	Copyright (c) 2022 Cyberon Corp.  All right reserved.
//	File: DListener.h
//	Date: 2022/4/8
//	Version : 1.00.00
///////////////////////////////////////////////////////////

#ifndef __DLISTENER__H__//20160203
#define __DLISTENER__H__//20160203

#if defined (_WIN32) || defined (WIN32_CE) || defined(_WIN32_WCE)
	#ifdef DLISTENER_EXPORTS
		#define DLISTENER_API __declspec(dllexport)
	#else
		#define DLISTENER_API __declspec(dllimport)
	#endif
#endif

#ifndef DLISTENER_API
#define DLISTENER_API
#endif //DLISTENER_API

#include "DListener_Const.h"

#ifdef __cplusplus
extern "C"{
#endif

typedef struct _DListenerSDKVersionInfo
{
	const char* pchSDKVersion;
	const char* pchSDKName;
	const char* pchReleaseTo;
	const char* pchReleaseDate;
	BOOL  bTrialVersion;
	BOOL  bOpenLicense;
} DListenerSDKVersionInfo;

/****************************/
/*		Create/Destroy		*/
/****************************/
DLISTENER_API HANDLE DListener_Init(const char* pchLibPath, const char* pchDataPath, const char* pchLicenseFile, const char* pchServerFile, const INT nLangID, INT* pnErr);
// Purpose: Initialize SDK
// Parameters: 
//		pchLibPath(IN): Path of libraries.
//		pchDataPath(IN): Path of Data.
//		pchLicenseFile(IN): Full path of License bin. (include file name)
//		pchServerFile(IN): Full path of Server credentials (include file name)
//		nLangID(IN): Language ID. Please refer to CYB_LANG_xxx in CYB_LangID.h 
//		pnErr(OUT): Error code if not null, otherwise nothing.
// Return:	If succeed, return DListener's handle;
//			Otherwise return NULL.
// Remark:

DLISTENER_API INT DListener_Release(HANDLE hRecognizer);
// Purpose	:	Destroy a recognizer
// Parameter:	hRecognizer(IN): the handle of recognizer
// Return:	If succeed, return DLISTENER_SUCCESS;
//			Otherwise return error code.

/****************************/
/*		Command Operation		*/
/****************************/
DLISTENER_API INT DListener_AddCommand(HANDLE hDListener, const UNICODE *lpwcCommand, BOOL bName, LONG lCommandID, DWORD dwCmdAttribute);
// Purpose	:	Add a command to DListener.
// Parameter:	hDListener(IN): the handle of DListener
//				lpwcCommand(IN): command name. It is an UNICODE(2 bytes/ little endian) string.
//				bName(IN): TRUE for people's name, and FALSE for command. Only for Chinese pronunciation of last name.
//				lCommandID(IN): command ID given by caller.
//				dwCmdAttribute(IN): Command attributes. Please refer to DLISTENER_CA_xxx in DListener_Const.h
// Return:		If succeed, return DLISTENER_SUCCESS;
//				Otherwise return error code (negative integer).

DLISTENER_API INT DListener_AddCommand_UTF8(HANDLE hDListener, const char *lpchCommand, BOOL bName, LONG lCommandID, DWORD dwCmdAttribute);
// Purpose	:	Add a UTF8 command to DListener.
// Parameter:	hDListener(IN): the handle of DListener
//				lpchCommand(IN): command name. It is an UTF8 string.
//				bName(IN): TRUE for people's name, and FALSE for command. Only for Chinese pronunciation of last name.
//				lCommandID(IN): command ID given by caller.
//				dwCmdAttribute(IN): Command attributes. Please refer to DLISTENER_CA_xxx in DListener_Const.h
// Return:		If succeed, return DLISTENER_SUCCESS;
//				Otherwise return error code (negative integer).

DLISTENER_API INT DListener_AddCommandEx(HANDLE hDListener, const UNICODE *lpwcCommand, const UNICODE *lpwcCommandPronunciation, BOOL bName, LONG lCommandID, DWORD dwCmdAttribute);
// Purpose	:	Add a command with another command as pronunciation to a recognizer.
// Parameter:	hDListener(IN): the handle of DListener
//				lpwcCommand(IN): command name. It is an UNICODE(2 bytes/ little endian) string.
//				lpwcCommandPronunciation(IN): command name. It is an UNICODE(2 bytes/ little endian) string.
//				bName(IN): TRUE for people's name, and FALSE for command. Only for Chinese pronunciation of last name.
//				lCommandID(IN): command ID given by caller.
//				dwCmdAttribute(IN): Command attributes. Please refer to DLISTENER_CA_xxx in DListener_Const.h
// Return:		If succeed, return DLISTENER_SUCCESS;
//				Otherwise return error code (negative integer).

DLISTENER_API INT DListener_DelCommand(HANDLE hDListener, const UNICODE *lpwcCommand, const LONG lCommandID, const DWORD dwCmdAttributes);
// Purpose	:	Delete a command in a recognizer. This API delete the commands only when both command string and ID match.
// Parameter:	hDListener(IN): the handle of DListener
//				lpwcCommand(IN): command name. It is an UNICODE(2 bytes/ little endian) string.
//				lCommandID (IN): command ID
//				dwCmdAttributes (IN): Command attributes. Please refer to DLISTENER_CA_xxx in DListener_Const.h
// Return:		If succeed, return DLISTENER_SUCCESS;
//				Otherwise return error code (negative integer).
// Remark:
//		The command which has the same lpwcCommand and lCommandID will be deleted.
//		This function can use multiple command attributes once.

DLISTENER_API INT DListener_DelCommand_UTF8(HANDLE hDListener, const char *lpchCommand, const LONG lCommandID, const DWORD dwCmdAttributes);
// Purpose	:	Delete a command in a DListener. This API delete the commands only when both command string(UTF8 format) and ID match.
// Parameter:	hDListener(IN): the handle of recognizer
//				lpchCommand(IN): command name. It is an UTF8 string.
//				lCommandID (IN): command ID
//				dwCmdAttributes (IN): Command attributes. Please refer to DLISTENER_CA_xxx in DListener_Const.h
// Return:		If succeed, return DLISTENER_SUCCESS;
//				Otherwise return error code (negative integer).
// Remark:
//		The command which has the same lpsCommand and lCommandID will be deleted.
//		This function can use multiple command attributes once.

DLISTENER_API INT DListener_DelCommandByName(HANDLE hDListener, const UNICODE *lpwcCommand, const DWORD dwCmdAttributes);
// Purpose	:	Delete commands by command name in DListener.
// Parameter:	hDListener(IN): the handle of recognizer
//				lpwcCommand(IN): command name. It is an UNICODE(2 bytes/ little endian) string.
//				dwCmdAttributes (IN): Command attributes. Please refer to DLISTENER_CA_xxx in DListener_Const.h
// Return:		If succeed, return DLISTENER_SUCCESS;
//				Otherwise return error code (negative integer).
// Remark:
//		The command which has the same lpwcCommand will be deleted.
//		This function can use multiple command attributes once.

DLISTENER_API INT DListener_DelCommandByName_UTF8(HANDLE hDListener, const char *lpchCommand, const DWORD dwCmdAttributes);
// Purpose	:	Delete commands by command name (UTF8 format) in DListener.
// Parameter:	hDListener(IN): the handle of recognizer
//				lpchCommand(IN): command name. It is an UTF8 string.
//				dwCmdAttributes (IN): Command attributes. Please refer to DLISTENER_CA_xxx in DListener_Const.h
// Return:		If succeed, return DLISTENER_SUCCESS;
//				Otherwise return error code (negative integer).
// Remark:
//		The command which has the same lpsCommand will be deleted.
//		This function can use multiple command attributes once.

DLISTENER_API INT DListener_DelCommandByID(HANDLE hDListener, const LONG lCommandID, const DWORD dwCmdAttributes);
// Purpose	:	Delete commands by ID in a DListener.
// Parameter:	hDListener(IN): the handle of DListener
//				lCommandID (IN): command ID
//				dwCmdAttributes (IN): Command attributes. Please refer to DLISTENER_CA_xxx in DListener_Const.h
// Return:		If succeed, return DLISTENER_SUCCESS;
//				Otherwise return error code (negative integer).
// Remark: 
//		Delete the command which has the same lCommandID.
//		This function can use multiple command attributes once.

DLISTENER_API INT DListener_RemoveAllCommand(HANDLE hDListener, const DWORD dwCmdAttributes);
// Purpose	:	Delete all commands which have the command attributes in DListener.
// Parameter:	hDListener(IN): the handle of recognizer
//				dwCmdAttributes (IN): Command attributes. Please refer to DLISTENER_CA_xxx in DListener_Const.h
// Return:		If succeed, return DLISTENER_SUCCESS;
//				Otherwise return error code (negative integer).
// Remark:
//		This function can use multiple command attributes once.

DLISTENER_API INT DListener_GetNumCommand(HANDLE hDListener, const DWORD dwCmdAttributes);
// Purpose	:	Get the total number of specific attributes of commands in DListener instance.
// Parameter:	hDListener(IN): the handle of recognizer
//				dwCmdAttributes (IN): Command attributes.
// Return:		If succeed, return the total number of commands in a recognizer instance;
//				Otherwise return error code (negative integer).
// Remark
//		This function can use multiple command attributes once.

DLISTENER_API INT DListener_GetCommandByIndex(HANDLE hDListener, WORD wCmdIdx, UNICODE *lpwcCmdNameBuf, INT *lpnCmdNameLen, LONG *lplCommandID, const DWORD dwCmdAttribute);
// Purpose	:	Get command name and command ID by command index
// Parameter:	hDListener(IN): the handle of DListener
//				wCmdIdx(IN): command index
// 				lpwcCmdNameBuf(OUT): buffer for command name. It is an UNICODE(2 bytes/ little endian) string.
//				lpnCmdNameLen(IN / OUT):(IN)size of lpwcCmdNameBuf/ (OUT)output Unicode string length.(including terminal character '\0')
//				lplCommandID(OUT) : Output Command ID
//				dwCmdAttribute (IN): Command attributes.
// Return:	If succeed, return DLISTENER_SUCCESS
//			Otherwise return error code (negative integer).

DLISTENER_API INT DListener_GetCommandByIndex_UTF8(HANDLE hDListener, WORD wCmdIdx, char *lpchCmdNameBuf, INT *lpnCmdNameLen, LONG *lplCommandID, const DWORD dwCmdAttribute);
// Purpose	:	Get command name(in UTF8 format) and command ID by command index
// Parameter:	hDListener(IN): the handle of DListener
//				wCmdIdx(IN): command index
// 				lpchCmdNameBuf(OUT): buffer for command name. It is an UTF8 string.
//				lpnCmdNameLen(IN / OUT):(IN)size of lpwcCmdNameBuf/ (OUT)output string length.(including terminal character '\0')
//				lplCommandID(OUT) : Output Command ID
//				dwCmdAttribute (IN): Command attributes.
// Return:	If succeed, return DLISTENER_SUCCESS
//			Otherwise return error code (negative integer).

DLISTENER_API INT DListener_LoadCommand(HANDLE hDListener, const char* lpchFilename, const DWORD dwCmdAttributes);
// Purpose	:	Load the commands from a file which is created by DListener_SaveCommand(...).
// Parameter:	hDListener(IN): the handle of DListener
//				lpchFilename (IN): The full path of the file name. It is an UNICODE or UTF8 string.
//				dwCmdAttributes (IN): Command attributes. Please refer to DLISTENER_CA_xxx in DListener_Const.h
// Return:		If succeed, return DLISTENER_SUCCESS;
//				Otherwise return error code (negative integer).
// Remark
//		This API will delete all commands which have the same attributes, then add all commands from the file.
//		This function can use multiple command attributes once.
DLISTENER_API INT DListener_SaveCommand(HANDLE hDListener, const char* lpchFilename, const DWORD dwCmdAttributes);
// Purpose	:	Save the commands to a file.
// Parameter:	DListener(IN): the handle of DListener
//				lpchFilename (IN): The full path of the file name. It is an UNICODE or UTF8 string.
//				dwCmdAttributes (IN): Command attributes. Please refer to DLISTENER_CA_xxx in DListener_Const.h
// Return:		If succeed, return DLISTENER_SUCCESS;
//				Otherwise return error code (negative integer).
// Remark
//		This function can save multiple command attributes once.

/************************************/
/*		Recognition Setting      	*/
/************************************/
DLISTENER_API INT DListener_SetRejectionLevel(HANDLE hDListener, INT nRejectionLevel);
// Purpose	:	Set Rejection Level
// Parameter:	hDListener(IN): the handle of DListener
//		nRejectionLevel(IN): 1 ~ 20; 20 = The most strong rejection
//						Default = 10
// Return:	If succeed, return DLISTENER_SUCCESS;
//			Otherwise return error code (negative integer).
// Remark:  Not use.

DLISTENER_API INT DListener_SetTimeout(HANDLE hDListener, WORD wTimeout);
// Purpose	:	Set maximum recognition time
// Parameter:	hDListener(IN): the handle of hDListener
//				wTimeout(IN): maximum recognition time in millisecond, default = 5000 (5 seconds).
// Return:	If succeed, return DLISTENER_SUCCESS;
//			Otherwise return error code (negative integer).

DLISTENER_API INT DListener_SetGrammar(HANDLE hDListener, DWORD dwGrammarAttribute);
// Purpose	:	Set the grammar rule of a recognizer instance.
// Parameter:	hDListener(IN): the handle of DListener
//				dwGrammarAttribute(IN): Grammar attribute. Please refer to DLISTENER_GA_xxx in DListener_Const.h 
// Return:	If succeed, return DLISTENER_SUCCESS;
//			Otherwise return error code (negative integer).
// Remark:
//		In Default Grammar(DLISTENER_GA_DEFAULT), Pre-Cmd and Central-Cmd are necessary, and Post-Cmd is optional.
//		When dwGrammarAttributes is set to DLISTENER_GA_NEED_POSTCMD, Post-Cmd is necessary.
//		When dwGrammarAttributes is set to  DLISTENER_GA_OPTIONAL_PRECMD, Pre-Cmd is optional.
//		When dwGrammarAttributes is set to  DLISTENER_GA_NEED_POSTCM | DLISTENER_GA_OPTIONAL_PRECMD, Post-Cmd is necessary and Pre-Cmd is optional.
//
//		This API is usually used for the language which has different grammar with Chinese.

DLISTENER_API INT DListener_SetEndingSilence(HANDLE hDListener, INT nEndingSilence);
// Purpose	:	Set ending silence time(For judging whether saying is over)
// Parameter:	hDListener(IN): the handle of DListener
//				nEndingSilence(IN): unit in millisecond, default is 300(0.3 second).
// Return:	If success, return DLISTENER_SUCCESS;
//			Otherwise return error code (negative integer).
// Remark: 
//			When ending silence is larger, user can have longer pause in saying and longer response time.

DLISTENER_API BOOL DListener_SetSettingFile( HANDLE hDListener, const char* lpchSettingFileName ) ;
// Purpose	:	Set setting file
// Parameter:	hDListener(IN): the handle of DListener
//				lpchSettingFileName(IN): the full path(include file name) of setting file
// Return:	If succeed, return TRUE;
//			Otherwise return FALSE.

/****************************/
/*		Language Operation	*/
/****************************/
DLISTENER_API INT DListener_GetAvailableLangID(const char* lpchLibPath, const char* lpchDataPath, INT *pLangID, INT nSize, INT* pnErr);
// Purpose	:	Get available languages CListener support in current environment before create recognizer.
// Parameter:
//		pchLibPath(IN): Path of libraries.
//		pchDataPath(IN): Path of Data.
//		pLangID(OUT): Array to save all supported language IDs.
//		nSize(IN): size of pLangID¡C
//		pnErr(OUT): error code.
// Return:	If succeed, return total number of available languages else 0;
// Remark: Give pLangID with null and nSize to 0 to get how many language support first to know the size allocate for pLangID.

DLISTENER_API INT DListener_GetAvailableLanguage(HANDLE hDListener, INT *pnLanguageBuf, INT nBufSize);
// Purpose	:	Get supported languages in a recognizer instance.
// Parameter:	hDListener(IN): the handle of DListener
//				pnLanguageBuf(OUT): Array to save all supported language IDs.
//				nBufSize(IN): size of pnLanguageBuf¡C
// Return:	If succeed, return total number of available languages;
//			Otherwise return error code (negative integer).
// Remark:
//		Language ID¡GCYB_LANG_MANDARIN_TWN¡BCYB_LANG_MANDARIN_CHN¡BCYB_LANG_ENGLISH_USA¡K . Please refer to CYB_LangID.h.
//		This API can be used to judge whether a recognizer is bilingual.
//		First, caller can call this API by setting pnLanguageBuf to NULL. After get total number of available languages, allocate memory for pnLanguageBuf, then call it again.

/************************/
/*		Recognition 	*/
/************************/
DLISTENER_API INT DListener_StartRecognition(HANDLE hDListener);
// Purpose	:	Start recognition flow (clear previous recognition result)
// Parameter:	hDListener(IN): the handle of DListener
// Return:	If succeed, return DLISTENER_SUCCESS;
//			Otherwise return error code (negative integer).

DLISTENER_API INT DListener_AddSample(HANDLE hDListener, SHORT *lpsSample, INT nNumSample);
// Purpose	:	Transfer voice PCM data to a recognizer and do recognition
// Parameter:	hDListener(IN): the handle of DListener
//				lpsSample(IN): buffer of voice PCM data. 16 bits/Mono/sample 16000(depend on input parameter of CListener_CreateRecognizer(...)). 
//				nNumSample(IN): Number of sample(voice data)
// Return:	DLISTENER_SUCCESS: the recognizer get recognition result and recognition flow should be stopping. 
//			DLISTENER_ERR_NEED_MORE_SAMPLE: the recognizer need more voice data to do recognition.
//			Otherwise return error code (negative integer).
// Remark:	If returned error code is: 
//				DLISTENER_ERR_TIMEOUT : Recognition time exceeds the timeout setting and still doesn't have recognition result. 
//										Caller can send error message to user and close this recognition 
//										or still go on calling CListener_AddSample(...) for recognition.
/****************************/
/*		Recognition Result	*/
/****************************/
DLISTENER_API INT DListener_GetResult(HANDLE hDListener, UNICODE* lpwcPreCmd, INT* pnPreCmdLen, LONG* plPreCmdID, UNICODE* lpwcCmd, INT* pnCmdLen, LONG* plCmdID, UNICODE* lpwcPostCmd, INT* pnPostCmdLen, LONG* plPostCmdID);
// Purpose	:	Get the best recognition result(include string and ID)
// Parameter:	
//		hDListener(IN): the handle of DListener
// 		lpwcPreCmd(OUT): buffer for pre-command string of recognition result(in 2byte/little endian UNICODE format)
//		pnPreCmdLen(IN/OUT): (IN)size of lpwcPreCmd/ (OUT) If succeed, it is the Unicode length of pre-command string of recognition result. (include terminal character '\0');
//		lplPreCmdID(OUT): buffer for pre-command ID of recognition result
// 		lpwcCmd(OUT): buffer for central-command string of recognition result(in 2byte/little endian UNICODE format)
//		pnCmdLen(IN/OUT): (IN) size of lpwcCmd/ (OUT) If succeed, it is the Unicode length of central-command string of recognition result. (include terminal character '\0');
//		plCmdID(OUT): buffer for central-command ID of recognition result
// 		lpwcPostCmd(OUT): buffer for post-command string of recognition result(in 2byte/little endian UNICODE format)
//		pnPostCmdLen(IN/OUT): (IN) size of lpwcPostCmd/ (OUT) If succeed, it is the Unicode length of post-command string of recognition result. (include terminal character '\0');
//		plPostCmdID(OUT): buffer for post-command ID of recognition result
// Return:	if succeed, return DLISTENER_SUCCESS
//			Otherwise return error code (negative integer).
// Remark:
//		The recognition result is a compounded command or a single command.
//		A compounded command is made up of pre-command + central-command + post-command.
//		A single command result will be saved on central-command field.

DLISTENER_API INT DListener_GetResult_UTF8(HANDLE hDListener, char* lpchPreCmd, INT* pnPreCmdLen, LONG* plPreCmdID, char* lpchCmd, INT* pnCmdLen, LONG* plCmdID, char* lpchPostCmd, INT* pnPostCmdLen, LONG* plPostCmdID);
// Purpose	:	Get the best recognition result(include string and ID)
// Parameter:	
//		hDListener(IN): the handle of DListener
// 		lpchPreCmd(OUT): buffer for pre-command string of recognition result(in 2byte/little endian UNICODE format)
//		pnPreCmdLen(IN/OUT): (IN)size of lpwcPreCmd/ (OUT) If succeed, it is the Unicode length of pre-command string of recognition result. (include terminal character '\0');
//		lplPreCmdID(OUT): buffer for pre-command ID of recognition result
// 		lpchCmd(OUT): buffer for central-command string of recognition result(in 2byte/little endian UNICODE format)
//		pnCmdLen(IN/OUT): (IN) size of lpwcCmd/ (OUT) If succeed, it is the Unicode length of central-command string of recognition result. (include terminal character '\0');
//		plCmdID(OUT): buffer for central-command ID of recognition result
// 		lpchPostCmd(OUT): buffer for post-command string of recognition result(in 2byte/little endian UNICODE format)
//		pnPostCmdLen(IN/OUT): (IN) size of lpwcPostCmd/ (OUT) If succeed, it is the Unicode length of post-command string of recognition result. (include terminal character '\0');
//		plPostCmdID(OUT): buffer for post-command ID of recognition result
// Return:	if succeed, return DLISTENER_SUCCESS
//			Otherwise return error code (negative integer).
// Remark:
//		The recognition result is a compounded command or a single command.
//		A compounded command is made up of pre-command + central-command + post-command.
//		A single command result will be saved on central-command field.

DLISTENER_API INT DListener_GetNBestResult(HANDLE hDListener, INT nNthCommand, WORD *lpnScore,
								UNICODE *lpwcPreCmds, INT *lpnPreCmdBufSize, LONG *lplPreCmdIDs,
								UNICODE *lpwcCmds, INT *lpnCmdBufSize, LONG *lplCmdIDs,
								UNICODE *lpwcPostCmds, INT *lpnPostCmdBufSize, LONG *lplPostCmdIDs);
// Purpose	:	Get the Nth recognition result(include string and ID)
// Parameter:	
//		hDListener(IN): the handle of DListener
//		nNthCommand(IN): index of recognition result
//		lpnScore(OUT): path score of recognition result
// 		lpwcPreCmd(OUT): buffer for pre-command string of recognition result(in 2byte/little endian UNICODE format)
//		lpnPreCmdBufSize(IN/OUT): (IN)size of lpwcPreCmd/ (OUT) If succeed, it is the Unicode length of pre-command string of recognition result. (include terminal character '\0');
//		lplPreCmdIDs(OUT): buffer for pre-command ID of recognition result
// 		lpwcCmd(OUT): buffer for central-command string of recognition result(in 2byte/little endian UNICODE format)
//		lpnCmdBufSize(IN/OUT): (IN) size of lpwcCmd/ (OUT) If succeed, it is the Unicode length of central-command string of recognition result. (include terminal character '\0');
//		lplCmdIDs(OUT): buffer for central-command ID of recognition result
// 		lpwcPostCmd(OUT): buffer for post-command string of recognition result(in 2byte/little endian UNICODE format)
//		lpnPostCmdBufSize(IN/OUT): (IN) size of lpwcPostCmd/ (OUT) If succeed, it is the Unicode length of post-command string of recognition result. (include terminal character '\0');
//		lplPostCmdIDs(OUT): buffer for post-command ID of recognition result
// Return:	if succeed, return DLISTENER_SUCCESS
//			Otherwise return error code (negative integer).
// Remark:
//		The recognition result is a compounded command or a single command.
//		A compounded command is made up of pre-command + central-command + post-command.
//		A single command result will be saved on central-command field.

DLISTENER_API INT DListener_GetNBestResult_UTF8(HANDLE hDListener, INT nNthCommand, WORD *lpnScore,
									  char *lpchPreCmds, INT *lpnPreCmdBufSize, LONG *lplPreCmdIDs,
									  char *lpchCmds, INT *lpnCmdBufSize, LONG *lplCmdIDs,
									  char *lpchPostCmds, INT *lpnPostCmdBufSize, LONG *lplPostCmdIDs);
// Purpose	:	Get the Nth recognition result(include string(in UTF8 format) and ID)
// Parameter:	
//		hDListener(IN): the handle of DListener
//		nNthCommand(IN): index of recognition result
//		lpnScore(OUT): path score of recognition result
// 		lpchPreCmds(OUT): buffer for pre-command string of recognition result(in UTF8 format)
//		lpnPreCmdBufSize(IN/OUT): (IN)size of lpsPreCmds/ (OUT) If succeed, it is the length of pre-command string of recognition result. (include terminal character '\0');
//		lplPreCmdIDs(OUT): buffer for pre-command ID of recognition result
// 		lpchCmds(OUT): buffer for central-command string of recognition result(in UTF8 format)
//		lpnCmdBufSize(IN/OUT): (IN) size of lpsCmds/ (OUT) If succeed, it is the length of central-command string of recognition result. (include terminal character '\0');
//		lplCmdIDs(OUT): buffer for central-command ID of recognition result
// 		lpchPostCmds(OUT): buffer for post-command string of recognition result(in UTF8 format)
//		lpnPostCmdBufSize(IN/OUT): (IN) size of lpsPostCmds/ (OUT) If succeed, it is the length of post-command string of recognition result. (include terminal character '\0');
//		lplPostCmdIDs(OUT): buffer for post-command ID of recognition result
// Return:	if succeed, return DLISTENER_SUCCESS
//			Otherwise return error code (negative integer).
// Remark:
//		The recognition result is a compounded command or a single command.
//		A compounded command is made up of pre-command + central-command + post-command.
//		A single command result will be saved on central-command field.


DLISTENER_API INT DListener_GetVersionInfo(char* pchLicenseFile, DListenerSDKVersionInfo *lpDListenerSDKVersionInfo);
// Purpose	:	Get SDK Version Info

#ifdef __cplusplus
}
#endif

#endif
