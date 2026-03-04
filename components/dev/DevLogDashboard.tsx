'use client'

import { devLogType } from '@/types/schemaType'
import DevLogDetailView from './DevLogDetailView'
import Column from '../flexBox/column'
import { useMediaQuery, useTheme } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { HomeIcon } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'
import useQueryString from '@/hooks/useQueryString'
import { cn } from '@/lib/utils'

dayjs.extend(relativeTime)
dayjs.locale('ko')

interface DevLogTypeWithJoinedInfo extends devLogType {
  nickname?: { nickname: string }
  name?: { name: string }
}

interface DevLogDashboardProps {
  devLogList: DevLogTypeWithJoinedInfo[]
}

export default function DevLogDashboard({ devLogList }: DevLogDashboardProps) {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { addQueryString } = useQueryString()

  const [selectedDevLog, setSelectedDevLog] = useState<DevLogTypeWithJoinedInfo | null>(null)

  const RouteToMyDevBlog = useCallback(() => {
    const userId = sessionStorage.getItem('userId')
    if (!userId) return

    router.push(`/dev/${userId}`)
  }, [])

  const handleClickDevLog = useCallback((devLog: DevLogTypeWithJoinedInfo) => {
    if (!devLog.pk) return

    addQueryString('devLogPk', devLog.pk.toString())
    setSelectedDevLog(devLog)
  }, [])

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Toolbar Area */}
      <div className="w-full h-10 relative flex">
        <HomeIcon className="cursor-pointer absolute top-0 right-0 size-4" onClick={RouteToMyDevBlog} />
      </div>

      <div className="w-full h-full flex">
        {/* Left Dashboard Area */}
        <div className="h-[calc(100vh-100px)] pb-[200px] overflow-y-scroll custom-scrollbar scrollbar-thin scrollbar-left pl-4">
          <div
            className={cn(
              `w-full h-fit grid gap-4`,
              selectedDevLog ? 'flex-[0.4]' : '',
              selectedDevLog
                ? 'md:grid-cols-2 sm:grid-cols-1 grid-cols-1'
                : 'md:grid-cols-4 sm:grid-cols-3 grid-cols-2',
            )}
          >
            {devLogList.map((devLog: DevLogTypeWithJoinedInfo) => (
              <DevLogDashboardItem key={devLog.pk ?? 0} devLog={devLog} onClick={() => handleClickDevLog(devLog)} />
            ))}
          </div>
        </div>

        {/*  File View Area  */}
        {selectedDevLog && (
          <Column gap={4} fullWidth className={isMobile ? 'w-[90vw]' : 'flex-[1] max-w-[70%] min-w-[70%]'}>
            <DevLogDetailView selectedDevLog={selectedDevLog} setSelectedDevLog={setSelectedDevLog} />
          </Column>
        )}
      </div>
    </div>
  )
}

export function DevLogDashboardItem({ devLog, onClick }: { devLog: DevLogTypeWithJoinedInfo; onClick: () => void }) {
  return (
    <Column
      gap={10}
      className="w-full overflow-hidden flex-shrink-0 bg-transparent border border-neutral-800 rounded-lg px-4 py-2 cursor-pointer hover:border-neutral-400 transition-all duration-100"
      onClick={onClick}
    >
      <Column>
        <h3 className="text-[12px] text-neutral-400 line-clamp-2 w-full break-keep">{devLog.address ?? ''}</h3>
        <h2 className="text-lg font-bold line-clamp-2 leading-[22px]">{devLog.title}</h2>
      </Column>
      <p className="text-sm text-neutral-400 line-clamp-2 w-full break-keep">{devLog.text ?? ''}</p>
      <div className="flex flex-col">
        {typeof devLog === 'object' && 'nickname' in devLog && (
          <p className="text-sm text-neutral-600">@{devLog.nickname?.nickname ?? ''}</p>
        )}
        <p className="text-sm text-neutral-600 mt-[-4px]">
          {dayjs(devLog?.updated_at ?? devLog?.created_at).fromNow()}
        </p>
      </div>
    </Column>
  )
}
