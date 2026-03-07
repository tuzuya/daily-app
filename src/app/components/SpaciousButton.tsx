"use client";

import React from "react";

interface SpaciousButtonProps {
  text?: string;
  onClick?: () => void;
}

export function SpaciousButton({ text = "Ask Spacious AI", onClick }: SpaciousButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center gap-[5px] px-[20px] py-[12px] border-none text-[1rem] text-white cursor-pointer rounded-[12px] transition-all duration-300 active:mt-[3px] shadow-[inset_0px_0px_5px_#ffffffa9,inset_0px_35px_30px_#000,0px_5px_10px_#000000cc] active:shadow-[inset_0px_0px_5px_#ffffffa9,inset_0px_35px_30px_#000] [text-shadow:1px_1px_1px_#000]"
      style={{
        background: "linear-gradient(90deg, #5bfcc4, #f593e4, #71a4f0)",
      }}
    >
      {/* 背面の光るエフェクト (::before) */}
      <div 
        className="absolute inset-0 m-auto rounded-[12px] -z-10 opacity-0 group-hover:opacity-100 group-hover:blur-[15px] group-active:opacity-100 group-active:blur-[5px] group-active:translate-y-[1px] transition-all duration-300"
        style={{
          background: "conic-gradient(#00000000 80deg, #40baf7, #f34ad7, #5bfcc4, #00000000 280deg)"
        }}
      />
      
      {/* SVG アイコン */}
      <svg viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
        <g fill="none">
          <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" />
          <path
            d="M9.107 5.448c.598-1.75 3.016-1.803 3.725-.159l.06.16l.807 2.36a4 4 0 0 0 2.276 2.411l.217.081l2.36.806c1.75.598 1.803 3.016.16 3.725l-.16.06l-2.36.807a4 4 0 0 0-2.412 2.276l-.081.216l-.806 2.361c-.598 1.75-3.016 1.803-3.724.16l-.062-.16l-.806-2.36a4 4 0 0 0-2.276-2.412l-.216-.081l-2.36-.806c-1.751-.598-1.804-3.016-.16-3.724l.16-.062l2.36-.806A4 4 0 0 0 8.22 8.025l.081-.216zM11 6.094l-.806 2.36a6 6 0 0 1-3.49 3.649l-.25.091l-2.36.806l2.36.806a6 6 0 0 1 3.649 3.49l.091.25l.806 2.36l.806-2.36a6 6 0 0 1 3.49-3.649l.25-.09l2.36-.807l-2.36-.806a6 6 0 0 1-3.649-3.49l-.09-.25zM19 2a1 1 0 0 1 .898.56l.048.117l.35 1.026l1.027.35a1 1 0 0 1 .118 1.845l-.118.048l-1.026.35l-.35 1.027a1 1 0 0 1-1.845.117l-.048-.117l-.35-1.026l-1.027-.35a1 1 0 0 1-.118-1.845l.118-.048l1.026-.35l.35-1.027A1 1 0 0 1 19 2"
            fill="currentColor"
          />
        </g>
      </svg>
      {text}
    </button>
  );
}