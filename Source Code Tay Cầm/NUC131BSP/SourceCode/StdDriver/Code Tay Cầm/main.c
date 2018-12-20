/****************************************************************************
 * @file     main.c
 * @version  V3.00
 * $Revision: 9 $
 * $Date: 15/06/04 10:36a $
 * @brief    Transmit and receive data from PC terminal through RS232 interface.
 * @note
 * Copyright (C) 2014 Nuvoton Technology Corp. All rights reserved.
 *
 ******************************************************************************/
#include <stdio.h>
#include "NUC131.h"
#include "string.h"
#include "stdbool.h"


#define PLL_CLOCK   50000000

#define RXBUFSIZE   1024
/*---------------------------------------------------------------------------------------------------------*/
/* Global variables                                                                                        */
/*---------------------------------------------------------------------------------------------------------*/
uint8_t g_u8RecData[RXBUFSIZE]  = {0};

volatile uint32_t g_u32comRbytes = 0;
volatile uint32_t g_u32comRhead  = 0;
volatile uint32_t g_u32comRtail  = 0;
volatile int32_t g_bWait         = TRUE;
char a[50];
uint8_t count=0;
uint8_t cre=0;
uint8_t btnselect=0,btnup=0,btndown=0,btnleft=0,btnright=0,btnfire=0;


/*---------------------------------------------------------------------------------------------------------*/
/* Define functions prototype                                                                              */
/*---------------------------------------------------------------------------------------------------------*/
int32_t main(void);
void UART_Receiver(void);
void UART_FunctionTest(void);
void Delay(int num);
void GPIO_SetMode(GPIO_T *port, uint32_t u32PinMask, uint32_t u32Mode);
uint8_t Check(char *arr );


void SYS_Init(void)
{
    /*---------------------------------------------------------------------------------------------------------*/
    /* Init System Clock                                                                                       */
    /*---------------------------------------------------------------------------------------------------------*/

    /* Enable Internal RC 22.1184MHz clock */
    CLK_EnableXtalRC(CLK_PWRCON_OSC22M_EN_Msk);

    /* Waiting for Internal RC clock ready */
    CLK_WaitClockReady(CLK_CLKSTATUS_OSC22M_STB_Msk);

    /* Switch HCLK clock source to Internal RC and HCLK source divide 1 */
    CLK_SetHCLK(CLK_CLKSEL0_HCLK_S_HIRC, CLK_CLKDIV_HCLK(1));

    /* Enable external XTAL 12MHz clock */
    CLK_EnableXtalRC(CLK_PWRCON_XTL12M_EN_Msk);

    /* Waiting for external XTAL clock ready */
    CLK_WaitClockReady(CLK_CLKSTATUS_XTL12M_STB_Msk);

    /* Set core clock as PLL_CLOCK from PLL */
    CLK_SetCoreClock(PLL_CLOCK);

    /* Enable UART module clock */
    CLK_EnableModuleClock(UART0_MODULE);

    /* Select UART module clock source */
    CLK_SetModuleClock(UART0_MODULE, CLK_CLKSEL1_UART_S_HXT, CLK_CLKDIV_UART(1));

    /*---------------------------------------------------------------------------------------------------------*/
    /* Init I/O Multi-function                                                                                 */
    /*---------------------------------------------------------------------------------------------------------*/

    /* Set GPB multi-function pins for UART0 RXD(PB.0) and TXD(PB.1) */
    SYS->GPB_MFP &= ~(SYS_GPB_MFP_PB0_Msk | SYS_GPB_MFP_PB1_Msk);
    SYS->GPB_MFP |= SYS_GPB_MFP_PB0_UART0_RXD | SYS_GPB_MFP_PB1_UART0_TXD;

}

void UART0_Init()
{
    /*---------------------------------------------------------------------------------------------------------*/
    /* Init UART                                                                                               */
    /*---------------------------------------------------------------------------------------------------------*/
    /* Reset UART0 module */
    SYS_ResetModule(UART0_RST);

    /* Configure UART0 and set UART0 Baudrate */
    UART_Open(UART0, 9600);
}


void sendComand(char *cmd){
     uint8_t i=0;
	   
	   UART_EnableInt(UART0, UART_IER_RDA_IEN_Msk);
	    
	  
	     
	  while((i<strlen(cmd))){
		    UART_WRITE(UART0,cmd[i]);
			  i++;
			  while(!UART_IS_TX_EMPTY(UART0)){};
		}
		   
		   Delay(12000000);
		UART_DisableInt(UART0,UART_IER_RDA_IEN_Msk);
		
		if(Check(a)==0){
		     count =0;
			   for(i=0;i<50;i++){
				    a[i]=0;			 
				 }
				 cre++;
				 
				 if(cre<4)  
					 sendComand(cmd);
				 else cre=0;	     
		}
		else{
		    count =0;	 
		}
		for(i=0;i<50;i++){
				    a[i]=0;
		}
		  		
}

void Delay(int num){
	   int j=0;
    for(j=0;j<num;j++){}
}
uint8_t  Check(char *arr )
{
	uint8_t result=0;
	uint8_t j=0;
	
   while(j<strlen(arr)){
	    if(arr[j] == 'O' && arr[j+1] == 'K') 
				{ 
					result++ ;
			    break;
				}
		  else result=0;
		  j++;
	 }
	 if(result>0) return 1;
	 else return 0;
}
void GPAB_IRQHandler(void)
{
    /* To check if PB.3 interrupt occurred */

    if(GPIO_GET_INT_FLAG(PA, BIT10))
    {       
			  GPIO_CLR_INT_FLAG(PA, BIT10);
			   btnselect=1;
			   PA->ISRC = PA->ISRC;		
    }
		
		 else if(GPIO_GET_INT_FLAG(PA, BIT11))
    {   
        GPIO_CLR_INT_FLAG(PA, BIT11);
			   btnleft=1;
			   PA->ISRC = PA->ISRC;
    }
		 else if(GPIO_GET_INT_FLAG(PA, BIT15))
    {   
        GPIO_CLR_INT_FLAG(PA, BIT15);
			   btnup=1;
			   PA->ISRC = PA->ISRC;
			
			
    }
		
		else if(GPIO_GET_INT_FLAG(PA, BIT14))
    {
        GPIO_CLR_INT_FLAG(PA, BIT14);
			  btndown=1;
			   PA->ISRC = PA->ISRC;	
    }
		
		else if(GPIO_GET_INT_FLAG(PA, BIT13))
    {
        GPIO_CLR_INT_FLAG(PA, BIT13);
			   btnright=1;
			   PA->ISRC = PA->ISRC;			
    }
		
		else if(GPIO_GET_INT_FLAG(PA, BIT12))
    {
        GPIO_CLR_INT_FLAG(PA, BIT12);
			   btnfire=1;
			   PA->ISRC = PA->ISRC;
    }
    else 
    {
        /* Un-expected interrupt. Just clear all PA, PB interrupts */
        PA->ISRC = PA->ISRC;
        PB->ISRC = PB->ISRC; 
    }
}


//}
/*---------------------------------------------------------------------------------------------------------*/
/* MAIN function                                                                                           */
/*---------------------------------------------------------------------------------------------------------*/

int main(void)
{
	uint8_t t=0;
    /* Unlock protected registers */
    SYS_UnlockReg();

    /* Init System, peripheral clock and multi-function I/O */
    SYS_Init();

    /* Lock protected registers */
    SYS_LockReg();

     /* Init UART0 for printf and testing */
     UART0_Init();
	
	  
		 GPIO_SetMode(PA,BIT1,GPIO_PMD_OUTPUT);
		 PA1=0;
		 
		 //SELCET KEY
			GPIO_SetMode(PA, BIT10, GPIO_PMD_QUASI);
      GPIO_EnableInt(PA, 10, GPIO_INT_FALLING);
      NVIC_EnableIRQ(GPAB_IRQn);
			//LEFT KEY
			GPIO_SetMode(PA, BIT11, GPIO_PMD_QUASI);
      GPIO_EnableInt(PA, 11, GPIO_INT_FALLING);
      NVIC_EnableIRQ(GPAB_IRQn);
			//FIGHT KEY
			GPIO_SetMode(PA, BIT12, GPIO_PMD_QUASI);
      GPIO_EnableInt(PA, 12, GPIO_INT_FALLING);
      NVIC_EnableIRQ(GPAB_IRQn);
			//RIGHT KEY
			GPIO_SetMode(PA, BIT13, GPIO_PMD_QUASI);
      GPIO_EnableInt(PA, 13, GPIO_INT_FALLING);
      NVIC_EnableIRQ(GPAB_IRQn);
			//DOWN KEY
			GPIO_SetMode(PA, BIT14, GPIO_PMD_QUASI);
      GPIO_EnableInt(PA, 14, GPIO_INT_FALLING);
      NVIC_EnableIRQ(GPAB_IRQn);
			//UP KEY
			GPIO_SetMode(PA, BIT15, GPIO_PMD_QUASI);
      GPIO_EnableInt(PA, 15, GPIO_INT_FALLING);
      NVIC_EnableIRQ(GPAB_IRQn);
		 
		 
     			
    while(1) {
			  //SELECT KEY
			 if(btnselect==1){
				 sendComand("AT+RST\r\n");
	       Delay(10000000);
         sendComand("AT+CWJAP=\"noname\",\"12345677\"\r\n");
	       Delay(10000000);
		 
	       sendComand("AT+CIPSTART=\"TCP\",\"54.169.158.78\",6969\r\n");
	       Delay(1000000);
				 sendComand("AT+CIPSEND=3\r\n");
			   Delay(5000);
				 sendComand("131");
				 Delay(10000);
			    btnselect=0;
			 }
			 //LEFT KEY
			 else if(btnleft==1)
        {
				 sendComand("AT+CIPSEND=5\r\n");
			   Delay(1000);
				 sendComand("131:A");
			   Delay(1000);
					btnleft=0;
				}
				//UP KEY
				else if(btnup==1)
        {
				 sendComand("AT+CIPSEND=5\r\n");
			   Delay(1000);
				 sendComand("131:W");
			   Delay(1000);
					btnup=0;
				}
				//RIGHT KEY
				else if(btnright==1)
        {
				 sendComand("AT+CIPSEND=5\r\n");
			   Delay(1000);
				 sendComand("131:D");
			   Delay(1000);
					btnright=0;
				}
				//down key
				else if(btndown==1)
        {
				 sendComand("AT+CIPSEND=5\r\n");
			   Delay(1000);
				 sendComand("131:S");
			   Delay(1000);
					btndown=0;
				}
				//fire key
				else if(btnfire==1)
        {
				 sendComand("AT+CIPSEND=5\r\n");
			   Delay(1000);
				 sendComand("131:F");
			   Delay(1000);
					btnfire=0;
				}
				else
        {
				    btnselect=0;
					  btnleft=0;
					  btnright=0;
					  btnup=0;
					  btndown=0;
					  btnfire=0;
				
				
				}
				
			
			 
		 }
		

}

/*---------------------------------------------------------------------------------------------------------*/
/* ISR to handle UART Channel 0 interrupt event                                                            */
/*---------------------------------------------------------------------------------------------------------*/
void UART02_IRQHandler(void)
{
    UART_Receiver();
}

/*---------------------------------------------------------------------------------------------------------*/
/* UART Callback function                                                                                  */
/*---------------------------------------------------------------------------------------------------------*/
void UART_Receiver()
{  
	 
	 
		  a[count]=UART_READ(UART0); 
			count++;
	    //Delay(10000);
	    
	
}
	
	 
	   