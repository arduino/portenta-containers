#ifndef __MYLINKLIST_H
#define __MYLINKLIST_H

#include "base_types.h"


#ifdef __cplusplus
extern "C"{
#endif

LPVOID	PointerList_Init();
VOID	PointerList_Release(LPVOID hPL);
VOID	PointerList_RemoveAll(LPVOID hPL);
BOOL	PointerList_AddTail(LPVOID hPL, LPVOID lpNewNodeDATA);
BOOL	PointerList_IsEmpty(LPVOID hPL);
//LPVOID	PointerList_GetHead(LPVOID hPL);
LPVOID	PointerList_RemoveHead(LPVOID hPL);
int		PointerList_GetCount(LPVOID hPL);


#ifdef __cplusplus
}
#endif


#endif
