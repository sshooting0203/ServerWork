const express = require('express')
const axios = require('axios')
// loadBalancer가 백엔드 서버 3대로 HTTP 요청을 전달하는데 사용

// loadBalancer역할을 수행하는 서버 생성
const loadBalancer = express()

let idx = 0
// 요청을 분배할 벡엔드 서버 3대 ...
const serverList = [
    '127.0.0.1:3000',
    '127.0.0.1:3001',
    '127.0.0.1:3002',
]

// 파비콘 요청은 따로 분리
// 파비콘은 웹 브라우저의 탭, 북마크, 주소 표시줄 등에서 표시되는 작은 아이콘
loadBalancer.get('/favicon.ico', (req, res) => {
    res.status(204)
})

// 요청 핸들러 작성
loadBalancer.all("*", (req, res) => {
    const { method, protocol, originalUrl } = req

    // 라운드 로빈 방식으로 서버를 선택
    const target = serverList[idx++]
    if(idx >= serverList.length) idx = 0

    // 타겟 서버로 요청 url 생성
    const requestUrl = `${protocol}://${target}${originalUrl}`

    // axios를 사용해 타겟 서버로 요청을 전달
    axios.request(requestUrl, {
        method
    })
        // 타겟 서버로부터 받은 응답을 클라이언트에 전달
        .then(result => {
            res.set({...result.headers})
            res.send(result.data)
        })
        .catch(error => {
            res.set({...error.headers})
            res.send(error)
        })
})

// 80번 포트에서 로드 밸런서 시작
loadBalancer.listen(80, err =>{
    err ?
    console.log('로드 밸런서 80번 포트에서 시작 실패'):
    console.log('로드 밸런서 80번 포트에서 시작')
})