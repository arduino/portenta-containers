#ifndef __DSPOTTER_API_H
#define __DSPOTTER_API_H

#if defined(_WIN32)
	#ifdef DSPDLL_EXPORTS
		#define DSPDLL_API __declspec(dllexport)
	#endif
#endif

#ifndef DSPDLL_API
#define DSPDLL_API
#endif

#include "base_types.h"
#include "DSpotterApi_Const.h"

#ifdef __cplusplus
extern "C"{
#endif

typedef struct _VerInfo
{
	const char *pchSDKName;
	const char *pchSDKVersion;
	const char *pchSDKType;
	const char *pchReleaseDate;
	const char *pchLicenseType;
	BOOL  bTrialVersion;
} VerInfo;

/** Main API */
DSPDLL_API HANDLE DSpotterInitMultiWithPackBin(char *lpchPackBin, BOOL *lpbEnableGroup, INT nMaxTime, BYTE *lpbyPreserve, INT nPreserve, INT *lpnErr, char *lpchLicenseFile, char *lpchServerFile);

DSPDLL_API HANDLE DSpotterInitMultiWithMod(char *lpchCYBaseFile, char **lppchGroupFile, INT nNumGroupFile, INT nMaxTime, BYTE *lpbyPreserve, INT nPreserve, INT *lpnErr, char *lpchLicenseFile, char *lpchServerFile); //Deprecated API.

DSPDLL_API INT DSpotterReset(HANDLE hDSpotter);

DSPDLL_API INT DSpotterRelease(HANDLE hDSpotter);

DSPDLL_API INT DSpotterGetCommandNumber(HANDLE hDSpotter);

DSPDLL_API INT DSpotterGetUTF8Command(HANDLE hDSpotter, INT nCmdIdx, BYTE *lpbyCommand);

DSPDLL_API INT DSpotterGetUTF16Command(HANDLE hDSpotter, INT nCmdIdx, UNICODE *lpwcCommand);

DSPDLL_API INT DSpotterGetSampleRate(HANDLE hDSpotter);

DSPDLL_API INT DSpotterGetNumGroup(char *lpchPackBin);

DSPDLL_API const char *DSpotterVerInfo(char *lpchLicenseFile, VerInfo *lpVerInfo, INT *lpnErr);

DSPDLL_API INT DSpotterAddSample(HANDLE hDSpotter, SHORT *lpsSample, INT nNumSample);

DSPDLL_API BOOL DSpotterIsKeywordAlive(HANDLE hDSpotter, INT *lpnErr);

DSPDLL_API INT DSpotterGetUTF8Result(HANDLE hDSpotter, INT *lpnCmdIdx, BYTE *lpbyResult, INT *lpnWordDura, INT *lpnEndSil, INT *lpnNetworkLatency, INT *lpnConfi, INT *lpnSGDiff, INT *lpnFIL);

DSPDLL_API INT DSpotterGetUTF16Result(HANDLE hDSpotter, INT *lpnCmdIdx, UNICODE *lpwcResult, INT *lpnWordDura, INT *lpnEndSil, INT *lpnNetworkLatency, INT *lpnConfi, INT *lpnSGDiff, INT *lpnFIL);

DSPDLL_API INT DSpotterGetUTF8ResultNoWait(HANDLE hDSpotter, INT *lpnCmdIdx, BYTE *lpbyResult, INT *lpnWordDura, INT *lpnEndSil, INT *lpnNetworkLatency, INT *lpnConfi, INT *lpnSGDiff, INT *lpnFIL);

DSPDLL_API INT DSpotterGetUTF16ResultNoWait(HANDLE hDSpotter, INT *lpnCmdIdx, UNICODE *lpwcResult, INT *lpnWordDura, INT *lpnEndSil, INT *lpnNetworkLatency, INT *lpnConfi, INT *lpnSGDiff, INT *lpnFIL);

DSPDLL_API INT DSpotterSetEnableNBest(HANDLE hDSpotter, BOOL bEnable);

DSPDLL_API INT DSpotterGetNBestUTF8ResultScore(HANDLE hDSpotter, INT *lpnCmdIdx, BYTE **lppbyResult, INT *lpnResultLength, INT *lpnScore, INT nMaxNBest);

DSPDLL_API INT DSpotterGetNBestUTF16ResultScore(HANDLE hDSpotter, INT *lpnCmdIdx, UNICODE **lppwcResult, INT *lpnResultLength, INT *lpnScore, INT nMaxNBest);

DSPDLL_API INT DSpotterGetCmdEnergy(HANDLE hDSpotter);

DSPDLL_API INT DSpotterSetResultIDMapping(HANDLE hDSpotter, char *lpchIDMappingPackBin);

DSPDLL_API INT DSpotterGetResultIDMapping(HANDLE hDSpotter);

/** Threshold API */
DSPDLL_API INT DSpotterSetRejectionLevel(HANDLE hDSpotter, INT nRejectionLevel); //Deprecated and replaced it with DSpotterSetConfiReward.

DSPDLL_API INT DSpotterSetConfiReward(HANDLE hDSpotter, INT nReward);

DSPDLL_API INT DSpotterSetSgLevel(HANDLE hDSpotter, INT nSgLevel); //Deprecated and replaced it with DSpotterSetSGDiffReward.

DSPDLL_API INT DSpotterSetSGDiffReward(HANDLE hDSpotter, INT nReward);

DSPDLL_API INT DSpotterSetFilLevel(HANDLE hDSpotter, INT nFilLevel); //Deprecated API.

DSPDLL_API INT DSpotterSetResponseTime(HANDLE hDSpotter, INT nResponseTime); //Deprecated and replaced it with DSpotterSetEndSil.

DSPDLL_API INT DSpotterSetEndSil(HANDLE hDSpotter, INT nEndSil);

DSPDLL_API INT DSpotterSetCmdResponseTime(HANDLE hDSpotter, INT nCmdIdx, INT nResponseTime); //Deprecated and replaced it with DSpotterSetCmdEndSil.

DSPDLL_API INT DSpotterSetCmdEndSil(HANDLE hDSpotter, INT nCmdIdx, INT nEndSil);

DSPDLL_API INT DSpotterSetEnergyTH(HANDLE hDSpotter, INT nEnergyTH);

DSPDLL_API INT DSpotterSetCmdReward(HANDLE hDSpotter, INT nCmdIdx, INT nReward); //Deprecated and replaced it with DSpotterSetCmdConfiReward.

DSPDLL_API INT DSpotterSetCmdConfiReward(HANDLE hDSpotter, INT nCmdIdx, INT nReward);

DSPDLL_API INT DSpotterSetCmdSGDiffReward(HANDLE hDSpotter, INT nCmdIdx, INT nReward);

DSPDLL_API INT DSpotterGetRejectionLevel(HANDLE hDSpotter, INT *lpnErr); //Deprecated and replaced it with DSpotterGetConfiReward.

DSPDLL_API INT DSpotterGetConfiReward(HANDLE hDSpotter, INT *lpnErr);

DSPDLL_API INT DSpotterGetSgLevel(HANDLE hDSpotter, INT *lpnErr); //Deprecated and replaced it with DSpotterGetSGDiffReward.

DSPDLL_API INT DSpotterGetSGDiffReward(HANDLE hDSpotter, INT *lpnErr);

DSPDLL_API INT DSpotterGetFilLevel(HANDLE hDSpotter, INT *lpnErr); //Deprecated API.

DSPDLL_API INT DSpotterGetCmdResponseTime(HANDLE hDSpotter, INT nCmdIdx, INT *lpnErr); //Deprecated and replaced it with DSpotterGetCmdEndSil.

DSPDLL_API INT DSpotterGetCmdEndSil(HANDLE hDSpotter, INT nCmdIdx, INT *lpnErr);

DSPDLL_API INT DSpotterGetEnergyTH(HANDLE hDSpotter, INT *lpnErr);

DSPDLL_API INT DSpotterGetCmdReward(HANDLE hDSpotter, INT nCmdIdx, INT *lpnErr); //Deprecated and replaced it with DSpotterGetCmdConfiReward.

DSPDLL_API INT DSpotterGetCmdConfiReward(HANDLE hDSpotter, INT nCmdIdx, INT *lpnErr);

DSPDLL_API INT DSpotterGetCmdSGDiffReward(HANDLE hDSpotter, INT nCmdIdx, INT *lpnErr);

DSPDLL_API INT DSpotterGetModelRejectionLevel(HANDLE hDSpotter, INT *lpnErr); //Deprecated and replaced it with DSpotterGetModelConfiReward.

DSPDLL_API INT DSpotterGetModelConfiReward(HANDLE hDSpotter, INT *lpnErr);

DSPDLL_API INT DSpotterGetModelSgLevel(HANDLE hDSpotter, INT *lpnErr); //Deprecated and replaced it with DSpotterGetModelSGDiffReward.

DSPDLL_API INT DSpotterGetModelSGDiffReward(HANDLE hDSpotter, INT *lpnErr);

DSPDLL_API INT DSpotterGetModelFilLevel(HANDLE hDSpotter, INT *lpnErr); //Deprecated API.

/** AGC API */
DSPDLL_API INT DSpotterAGCEnable(HANDLE hDSpotter);

DSPDLL_API INT DSpotterAGCDisable(HANDLE hDSpotter);

DSPDLL_API INT DSpotterAGCSetMaxGain(HANDLE hDSpotter, FLOAT fMaxGain);

DSPDLL_API INT DSpotterAGCSetIncGainThrd(HANDLE hDSpotter, SHORT sLowerThrd);

#if defined(_WIN32)
typedef INT (__stdcall *DSpotterAGC_GetAGCData_Callback)(SHORT *lpsOutputSample, INT nSampleNum, VOID *lpParam);
#else
typedef INT (*DSpotterAGC_GetAGCData_Callback)(SHORT *lpsOutputSample, INT nSampleNum, VOID *lpParam);
#endif
DSPDLL_API INT DSpotterAGCSetCallback(HANDLE hDSpotter, DSpotterAGC_GetAGCData_Callback lpfnCallback, VOID *lpParam);

/** Utility API */
DSPDLL_API INT DSpotterCombinePackBin(char **lppchPackBin, INT nNumPackBin, char *lpchOutPackBin);

DSPDLL_API INT DSpotterCombineMapIDPackBin(char **lppchIDMappingPackBin, INT nNumIDMappingPackBin, char *lpchOutIDMappingPackBin);

#ifdef __cplusplus
}
#endif

#endif // __DSPOTTER_API_H
