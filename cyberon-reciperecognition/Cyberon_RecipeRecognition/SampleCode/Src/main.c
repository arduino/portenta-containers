/************************************************************************/
//Include Files                                                                     
/************************************************************************/
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>
#include <unistd.h>
#include "Recognizer.h"

/************************************************************************/
//Defined Macro & Value
/************************************************************************/
#define _MAX_LINE_LEN_ (1024)

/************************************************************************/
//Global Flag
/************************************************************************/
BOOL g_bBrk = FALSE;

/************************************************************************/
//Local Functions
/************************************************************************/
static INT ParseIni(const CHAR *filename, INT *nlangID, CHAR **LibPath, CHAR **DataPath, CHAR **CommandFile, CHAR **DSpotterLicenseFile, CHAR **DListenerLicenseFile, CHAR **ServerFile, BOOL *bIsSaveRecordData)
{
    FILE *fp;
    CHAR lpchzLine[_MAX_LINE_LEN_], *pchToken;
    INT nOff,n;
    BYTE lpchzFileHeader[3];
    CHAR *wrd[2];

    //Open file
    if ((fp = fopen(filename, "rb")) == NULL)
    {
        printf("Fail to open <%s>!\n", filename);
        return __RECOGNIZER_ERR_OPEN_FILE__;
    }

    //Read file
    while (fgets(lpchzLine, _MAX_LINE_LEN_, fp) != NULL)
    {
        nOff=0;
        pchToken = strtok(lpchzLine,"\n");
        wrd[0]=strtok(pchToken,"=");
        wrd[1]=strtok(NULL,"=");
        if (strcmp(wrd[0], "LangID") == 0)
        {
            *nlangID = atoi(wrd[1]);
        }
        else if (strcmp(wrd[0], "Lib path") == 0)
        {
            n = strlen(wrd[1]) * sizeof(CHAR);
            *LibPath = malloc(n);
            memset(*LibPath, 0, n);
            strcpy(*LibPath, wrd[1]);
        }
        else if (strcmp(wrd[0], "Data path") == 0)
        {
            n = strlen(wrd[1]) * sizeof(CHAR);
            *DataPath = malloc(n);
            memset(*DataPath, 0, n);
            strcpy(*DataPath, wrd[1]);
        }
        else if (strcmp(wrd[0], "Command File") == 0)
        {
            n = strlen(wrd[1]) * sizeof(CHAR);
            *CommandFile = malloc(n);
            memset(*CommandFile, 0, n);
            strcpy(*CommandFile, wrd[1]);
        }
        else if (strcmp(wrd[0], "DSpotter License File") == 0)
        {
            n = strlen(wrd[1]) * sizeof(CHAR);
            *DSpotterLicenseFile = malloc(n);
            memset(*DSpotterLicenseFile, 0, n);
            strcpy(*DSpotterLicenseFile, wrd[1]);
        }
        else if (strcmp(wrd[0], "DListener License File") == 0)
        {
            n = strlen(wrd[1]) * sizeof(CHAR);
            *DListenerLicenseFile = malloc(n);
            memset(*DListenerLicenseFile, 0, n);
            strcpy(*DListenerLicenseFile, wrd[1]);
        }
        else if (strcmp(wrd[0], "Server File") == 0)
        {
            n = strlen(wrd[1]) * sizeof(CHAR);
            *ServerFile = malloc(n);
            memset(*ServerFile, 0, n);
            strcpy(*ServerFile, wrd[1]);
        }
        else if (strcmp(wrd[0], "IsSaveRecordData") == 0)
        {
            if (atoi(wrd[1])==0)
                *bIsSaveRecordData = FALSE;
            else
                *bIsSaveRecordData = TRUE;
        }
    }
    fclose(fp);
    return 0;

}

//SigHandle to break mode
static VOID SigHandler(INT nSig)
{
    g_bBrk=TRUE;
}

//Callback from thread
INT RecognizerCB(INT nFlag, RecognitionResult *poResult, INT nResNum)
{
    INT i;
    if (nFlag == _RECOGNIZER_CB_FLAG_RECOGNITON_START_)
    {
        printf("\nCB: Recognition starts.\n");
        printf("\nCB: Please say wake word, or 'Ctrl+c' to stop recognition\n");
        //printf("\nWakeword:\n");
        //Recognizer_ShowTrigger(hRecognizer);
        //printf("-----------------------------------------\n");
    }
    else if (nFlag == _RECOGNIZER_CB_FLAG_RECOGNITON_END_)
        printf("\nCB: Recognition end!\n");
    else if (nFlag == _RECOGNIZER_CB_FLAG_RECOGNITON_RESULT_)
    {
        if (nResNum == 0)
            printf("\nCB: No recognition result!\n");

        for (i = 0; i < nResNum; i++)
        {
            if (strlen(poResult[i].pchzSingleCmd) > 0)
                printf("\nCB: Recognition result [%d]: %s, ID = %d, Score = %hu, \n", i, poResult[i].pchzSingleCmd,  poResult[i].lSingCmdID, poResult[i].wScore);
            else
            {
                printf("\nCB: Wrong command mode!\n");
            }
        }
    }
    else if (nFlag == _RECOGNIZER_CB_FLAG_RECOGNITON_AWAKE_)
    {
        printf("\nCB: Recognition wake word detect: [%s], Score: %d\n", poResult[0].pbyResult,poResult[0].nConfi);
        printf("\nCB: Please say command, or 'Ctrl+c' to stop recognition\n");
        //printf("\nRecipe in list:\n");
        //Recognizer_ShowCommandList(hRecognizer);
        //printf("-----------------------------------------\n");
    }
    else if (nFlag == _RECOGNIZER_CB_FLAG_RECOGNITON_TIMEOUT_)
    {
        printf("\nCB: Timeout\n");
        printf("\nCB: Please say wakeword, or 'Ctrl+c' to stop recognition\n");
        //printf("\nWakeword:\n");
        //Recognizer_ShowTrigger(hRecognizer);
        //printf("-----------------------------------------\n");
    }
}

void ShowCommand(HANDLE hRecognizer){
    printf("-----------------------------------------\n");
    printf("Recipe in list:\n");
    Recognizer_ShowCommandList(hRecognizer);
    printf("-----------------------------------------\n");
}

void ShowTrigger(HANDLE hRecognizer){
    printf("-----------------------------------------\n");
    printf("Wakeword:\n");
    Recognizer_ShowTrigger(hRecognizer);
    printf("-----------------------------------------\n");
}
    
/************************************************************************/
//Main function
/************************************************************************/
INT main(INT argc, CHAR *argv[])
{
    struct sigaction sa;
    memset(&sa, 0, sizeof(struct sigaction));
    sa.sa_handler = SigHandler;
    sa.sa_flags = 0; // not SA_RESTART!;
    sigaction(SIGINT, &sa, NULL);

    //Declara parameter
    INT n,i;
    CHAR ch;
    CHAR str[256], *pchToken;
    INT nCommandID;
    HANDLE hRecognizer = NULL;
    const CHAR *filename;
    INT nErr=0;
    INT nlangID=0;
    CHAR *LibPath=NULL;
    CHAR *DataPath=NULL;
    CHAR *CommandFile=NULL;
    CHAR *DSpotterLicenseFile=NULL;
    CHAR *DListenerLicenseFile=NULL;
    CHAR *ServerFile=NULL;
    BOOL bIsSaveRecordData=FALSE;
    INT nRes,nOff;
    INT nCurrentMode;
    //Show Usage
    if (argc > 1)
    {
        printf("Error: too many arguments!\n");
        printf("Usage: %s",argv[0]);
        return-1;
    }
    
    //Parse a hardcore "CarPlateRecognizeDemo.ini file"
    ParseIni("RecipeRecognizer.ini", &nlangID, &LibPath, &DataPath, &CommandFile, &DSpotterLicenseFile, &DListenerLicenseFile, &ServerFile, &bIsSaveRecordData);

    //Init Recognizer
    hRecognizer = Recognizer_Init(LibPath, DataPath, DSpotterLicenseFile, DListenerLicenseFile, ServerFile, nlangID, &nErr);

    if (hRecognizer==NULL)
        goto ERR_MAIN;

    //ADD Commands from file
    Recognizer_ReloadCommandFromFile(hRecognizer, CommandFile);
    
    SAFE_FREE(LibPath);
    SAFE_FREE(DataPath);
    SAFE_FREE(CommandFile);
 
    while (1)
    {
        //Show Command Lists
        system("clear");
        ShowCommand(hRecognizer);
        //Show Commands
        printf("The following list of commands is available, or press 'Q' to exit...\n"
               "(A)dd Recipe\n"
               "(D)elete Recipe\n"
               "(C)lear Recipe\n"
               "(L)oad Recipe\n"
               "(S)tart Recognition\n"
               "-----------------------------------------\n"
               ">> ");
        system("/bin/stty raw");
        ch=getchar();
        system("/bin/stty cooked");
        if (ch == 'q' || ch == 'Q')
        {
            printf("\n");
            system("clear");
            break;
        }
        else if (ch == 'a' || ch == 'A')
        {
            g_bBrk = FALSE;
            while (g_bBrk != TRUE)
            {
                //Clean Buffer
                nOff=0;
                memset(str,0,256*sizeof(char));
                nCommandID=-1;
                //Show Command Lists
                system("clear");
                ShowCommand(hRecognizer);

                //Add Command
                printf("\nPlease enter the new recipe ID, or 'Ctrl+c' to return\n"
                       ">> ");
                fgets(str,256,stdin);
                if (g_bBrk!=TRUE){
                    pchToken=strtok(str, "\n");
                    nCommandID=atoi(pchToken);
                    memset(str,0,256*sizeof(char));
                    printf("\nPlease enter the new recipe string\n"
                            ">> ");
                    fgets(str,256,stdin);
                    pchToken=strtok(str, "\n");

                    Recognizer_AddCommand(hRecognizer, nCommandID, pchToken);
                }
            }
        }
        else if (ch == 'c' || ch == 'C')
        {
            printf("\nClear All Command\n");
            Recognizer_DeleteAllCommand(hRecognizer);
        }
        else if (ch == 'l' || ch == 'L')
        {
            printf("\nReload All Command\n");
            Recognizer_ReloadCommandFromFile(hRecognizer, "Recipe.txt");
        }
        else if (ch == 'd' || ch == 'D')
        {
            g_bBrk = FALSE;
            while (g_bBrk != TRUE)
            {
                //Clean Buffer
                nOff=0;
                memset(str,0,256*sizeof(char));

                //Show Command Lists
                system("clear");
                ShowCommand(hRecognizer);

                //Delete Commands
                printf("\nPlease enter the recipt string to delete, or 'Ctrl+c' to return\n"
                       ">> ");
                fgets(str, 256, stdin);
                if (g_bBrk!=TRUE){
                pchToken=strtok(str, "\n");
                Recognizer_DeleteCommand(hRecognizer, pchToken);
                }
            }
        }
        else if (ch == 's' || ch == 'S')
        {
            system("clear");
            nCurrentMode=TRIGGERMODE;
            ShowTrigger(hRecognizer);
            //Start Recognizing
            nRes = Recognizer_Start(hRecognizer, RecognizerCB, bIsSaveRecordData);
            if (nRes != __RECOGNIZER_SUCCESS__)
            {
                printf("Main:: Fail to start recognition!\n");
                goto ERR_MAIN;
            }
            //Is Recognizing
            g_bBrk = FALSE;
            //Show Trigger
            while (Recognizer_IsRecognizing(hRecognizer) && g_bBrk != TRUE)
            {
                fflush(stdout);
                usleep(500000);
                if (Recognizer_CurrentMode(hRecognizer)!=nCurrentMode)
                {
                    if((nCurrentMode=Recognizer_CurrentMode(hRecognizer))==TRIGGERMODE)
                    {
                        ShowTrigger(hRecognizer);
                    }
                    else if ((nCurrentMode=Recognizer_CurrentMode(hRecognizer))==COMMANDMODE)
                    {                
                        ShowCommand(hRecognizer);
                    }
                }
                printf("\rListening...");
            }

            //Stop Recognizing
            Recognizer_Stop(hRecognizer);

            printf("\npress to return...\n");
            system("/bin/stty raw");
            ch=getchar();
            system("/bin/stty cooked");
        }
    }

    //Save Commands to File
    if (argc == 2)
        Recognizer_WriteCommandToFile(hRecognizer, argv[1]);
    else
        Recognizer_WriteCommandToFile(hRecognizer, "RecipeTmp.txt");

    //Release
    Recognizer_Release(hRecognizer);
    SAFE_FREE(LibPath);
    SAFE_FREE(DataPath);
    SAFE_FREE(CommandFile);
    SAFE_FREE(DSpotterLicenseFile);
    SAFE_FREE(DListenerLicenseFile);
    SAFE_FREE(ServerFile);
    return 0;
ERR_MAIN:
    Recognizer_Release(hRecognizer);
    SAFE_FREE(LibPath);
    SAFE_FREE(DataPath);
    SAFE_FREE(CommandFile);
    SAFE_FREE(DSpotterLicenseFile);
    SAFE_FREE(DListenerLicenseFile);
    SAFE_FREE(ServerFile);
    printf("Error Code: %d\n",nErr);
    return -1;

}