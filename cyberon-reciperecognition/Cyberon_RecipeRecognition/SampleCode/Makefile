# A Makefile for CarPlateRecognize for NXP on Linux x86, created by Tom, 2020/4/23
# --- MACROS

APP_DIR = $(shell pwd)

PREFIX = aarch64-linux-gnu-

CC      = $(PREFIX)gcc
AS      = $(PREFIX)as
LD      = $(PREFIX)ld
AR      = $(PREFIX)ar
OBJDUMP = $(PREFIX)objdump
OBJCOPY = $(PREFIX)objcopy
NM      = $(PREFIX)nm
ECHO    = echo	

SUB_DIRS =
CURRDIR = $(shell pwd)

#VR directory
VR_ROOT_DIR = $(CURRDIR)

CFLAGS := -Wall -O2 -pthread
CDEFINES := -DLINUX
INCLUDES := -ISrc -IInclude
LIB := -lDSpotter -lDListener -lLexMgr.0410 -lDVSRPro -lWaveIO -ldl 
LDFLAGS := -Wl,-rpath='$$ORIGIN/Lib' -L./lib/imx8mm

CFLAGS+=$(CDEFINES)
CFLAGS+=$(INCLUDES)

SRC := Src/main.c
SRC += Src/Recognizer.c
SRC += Utils/MyLinkList.c

CSRC:=$(filter %.c,$(SRC))
CPPSRC:=$(filter %.cpp,$(SRC))

COBJ := $(CSRC:.c=.o)
CPPOBJ := $(CPPSRC:.cpp=.o)

OBJ := $(COBJ)
OBJ += $(CPPOBJ)

# --- IMPLICITY RULE
%.o: %.c
	$(CC) -c $(CFLAGS) -o $*.o $<
%.o: %.cpp
	$(CC) -c $(CFLAGS) -o $*.o $<


# --- TARGET
all: RecipeRecognizerDemo

RecipeRecognizerDemo: $(OBJ)
	$(CC) $(CFLAGS) -o $@ $(OBJ) $(LDFLAGS) $(LIB)
	rm -f $^

.PHONY: clean
clean:
	rm -f RecipeRecognizerDemo
	rm -f $(OBJ)

ifndef FORCE
-include $(OBJS:.o=.d)
endif
