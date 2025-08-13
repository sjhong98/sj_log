import { Dialog, DialogContent, Typography } from "@mui/material";
import { SearchIcon } from "lucide-react";
import Row from "../flexBox/row";
import { useState, useEffect, useCallback, useImperativeHandle } from "react";

export default function SearchInput({ dialogComponent, ref }: { dialogComponent: React.ReactNode, ref: React.RefObject<any> }) {
    const [open, setOpen] = useState(false)

    // Command + K 단축키 감지
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault()
            setOpen(true)
        }
    }, [])

    // 전역 키보드 이벤트 리스너 등록
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleKeyDown])

    const close = () => setOpen(false)

    useImperativeHandle(ref, () => {
        return {
            close
        }
    }, [])

    return (
        <>
            <Row fullWidth gap={1} className='rounded-md p-2 border-[#333] hover:border-[#ddd] border-[1px] h-12 flex items-center pl-4 pr-5 group cursor-pointer' onClick={() => setOpen(true)}>
                <SearchIcon className='text-[#333] group-hover:text-[#ddd] duration-100' />
                <Typography variant="body1" className='text-[#333] group-hover:text-[#ddd] duration-100'>Search ⌘K</Typography>
            </Row>

            <Dialog open={open} onClose={() => setOpen(false)} className='overflow-hidden'>
                <DialogContent className='bg-[#111] text-[#ddd] !p-0 overflow-hidden'>
                    {dialogComponent}
                </DialogContent>
            </Dialog>
        </>
    )
}