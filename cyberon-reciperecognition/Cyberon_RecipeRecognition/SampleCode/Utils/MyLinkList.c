#include <stdlib.h>
#include "MyLinkList.h"


typedef struct _DATANODE
{
	VOID *m_lpData;
	struct _DATANODE *m_lpoNext;
}	Node;//, *LPNode;



typedef struct _PointerList
{
	int m_nNodeCount;

	Node *m_lpHead;
	Node *m_lpTail;
}	POINTERLIST;


LPVOID PointerList_Init()
{
	POINTERLIST *poPointerList;
	
	poPointerList = (POINTERLIST*)malloc(sizeof(POINTERLIST));

	poPointerList->m_nNodeCount = 0;
	poPointerList->m_lpHead = NULL;
	poPointerList->m_lpTail = NULL;
	
	return poPointerList;
}

VOID PointerList_Release(LPVOID hPL)
{
	PointerList_RemoveAll(hPL);
	free(hPL);
	return;
}

VOID PointerList_RemoveAll(LPVOID hPL)
{
	Node *lpThisNode, *lpNextNode;
	POINTERLIST *pPL;

	pPL = (POINTERLIST*)hPL;

	// Get This Node & Next Node
	lpThisNode = pPL->m_lpHead;
	while (lpThisNode != NULL)
	{
		lpNextNode = lpThisNode->m_lpoNext;

		// Clear this Node
		//delete lpThisNode;
		free(lpThisNode);

		// Move to Next Node
		lpThisNode = lpNextNode;
	}

	pPL->m_nNodeCount = 0;
	pPL->m_lpHead = NULL;
	pPL->m_lpTail = NULL;
}

BOOL PointerList_AddTail(LPVOID hPL, LPVOID lpNewNodeDATA)
{
	Node *lpThisNode;
	POINTERLIST *pPL;

	pPL = (POINTERLIST*)hPL;

	
	//lpThisNode = new Node;
	lpThisNode = (Node*)malloc(sizeof(Node));

	if (lpThisNode == NULL)
		return FALSE;

	lpThisNode->m_lpData = lpNewNodeDATA;
	lpThisNode->m_lpoNext = NULL;

	if (pPL->m_lpTail == NULL)
	{
		pPL->m_lpHead = lpThisNode;
	}
	else
	{
		pPL->m_lpTail->m_lpoNext = lpThisNode;
	}
	pPL->m_lpTail = lpThisNode;

	pPL->m_nNodeCount++;

	return TRUE;
}

BOOL PointerList_IsEmpty(LPVOID hPL)
{
	POINTERLIST *pPL;

	pPL = (POINTERLIST*)hPL;
	if (pPL->m_nNodeCount == 0)
		return TRUE;
	else
		return FALSE;
}


LPVOID PointerList_RemoveHead(LPVOID hPL)
{
	Node *lpNextNode;
	LPVOID lp_temp;
	POINTERLIST *pPL;

	pPL = (POINTERLIST*)hPL;

	// Make Sure Link List is not Empty
	if (pPL->m_lpHead == NULL)
		return NULL;
	
	// Get This Node & Next Node
	lp_temp = pPL->m_lpHead->m_lpData;
	lpNextNode = pPL->m_lpHead->m_lpoNext;

	// Delete head and update it
	//delete m_lpHead;
	free(pPL->m_lpHead);
	pPL->m_lpHead = lpNextNode;

	// Node Count decrease 
	pPL->m_nNodeCount--;

	if (pPL->m_lpHead == NULL)
		pPL->m_lpTail = NULL;

	return (lp_temp);
}

int PointerList_GetCount(LPVOID hPL)
{
	POINTERLIST *pPL;

	pPL = (POINTERLIST*)hPL;

	return pPL->m_nNodeCount;
}