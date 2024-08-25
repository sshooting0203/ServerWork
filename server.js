// server.js
// 1. 서버 구성에 사용할 express
const express = require('express')

// 2. 서버 3개 생성
const app1 = express()
const app2 = express()
const app3 = express()

// 3. 응답 내용 구성
const mainHandler = num => (req, res) => {
    res.send(`<h1>안녕하세요 ${num} 번 서버입니다.</h1>`)
}

// 4. 메인 url로 요청이 오면 응답 내용 반환
app1.get('/', mainHandler(1))
app2.get('/', mainHandler(2))
app3.get('/', mainHandler(3))


// 5. 서버 시작 메시지
const errHandler = num => err => {
    err ?
    console.log(`${num} 번 서버 시작 실패`):
    console.log(`${num} 번 서버 시작`)    
}

// 6. 서버 시작
app1.listen(3000, errHandler(1))
app2.listen(3001, errHandler(2))
app3.listen(3002, errHandler(3))