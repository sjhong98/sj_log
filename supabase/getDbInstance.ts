import { checkSession } from '@/actions/session/checkSession';
import { getUser } from '@/actions/session/getUser'
import { createClient } from '@supabase/supabase-js'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool, PoolClient } from 'pg'

const pool = new Pool({
    connectionString: process.env.SUPABASE_URL, // anon URL 가능, 서비스 키 아님
});

/**
 * JWT 기반 Drizzle DB 인스턴스 반환 (수동 릴리즈 필요)
 * @returns Drizzle DB 인스턴스와 release 함수
 */
export async function getDbInstance(): Promise<any> {
    try {
        // 쿠키에서 직접 토큰 가져오기
        const { cookies } = await import('next/headers')
        const cookie = await cookies()
        const currentCookie: any = cookie.get('logToken')
        const token = currentCookie?.value ?? ''
        
        if (!token) {
            throw new Error('액세스 토큰이 없습니다.')
        }
        
        // 사용자 정보 확인 (선택사항)
        const user = await getUser()
        
        if (!user) {
            throw new Error('사용자 인증 정보가 없습니다.')
        }
    

        // 커넥션 연결
        const client: PoolClient = await pool.connect();

        try {
            // 요청시 JWT 토큰 실도록 설정 (요청마다 JWT 토큰이 전송되고, Supabase는 이를 인식하여 auth.users와 비교
            await client.query(
                `SELECT set_config('request.jwt.claims', $1, true)`,
                [token]
            );

            // Drizzle DB 인스턴스 생성
            const db = drizzle(client);

            // maximum pool 개수 제한으로 인한 release 함께 반환
            return {
                db,
                release: () => client.release(),
            };
        } catch (err) {
            client.release();
            throw err;
        }
    } catch (err) {
        console.error('getDbInstance 에러:', err);
        throw new Error(`데이터베이스 연결 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    }
}

/**
 * 자동으로 커넥션을 관리하는 DB 인스턴스 래퍼
 * @param callback DB 작업을 수행하는 콜백 함수
 * @returns 콜백 함수의 결과
 */
export async function dbCallback<T>(
    callback: (db: any) => Promise<T>
): Promise<T> {
    const { db, release } = await getDbInstance();
    
    try {
        const result = await callback(db);
        return result;
    } finally {
        release();
    }
}
