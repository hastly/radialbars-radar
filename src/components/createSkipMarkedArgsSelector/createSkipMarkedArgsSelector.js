// createSkipMarkedArgsSelector (2)
/*
    Реализовать high ordered функцию
    принимающую любое количество функций,
    последняя из которых принимает на вход результаты выполнения всех остальных,
        запущенных от аргументов функции-результата high ordered функции.
        
    Функция-результат при вызове, запускает все функции-аргументы high ordered функции, кроме последней со своими аргументами.
    Если хотя бы один из результатов изменился по сравнению с предыдущим вызовом,
        возвращает результат последней функции-аргумента high ordered функции от результатов,
    иначе
        возвращает закэшированный результат своего предыдущего вызова.
        

    Дополнительно реализовать возможность помечать некоторые аргументы  high ordered функции, как не требующие перерасчета при изменении своего результата. Дополнительно реализовать возможность настройки high ordered функции  для работы с кастомным методом сравнения.

    Два допущения:
    - для простоты реализации сравнения принимается, что промежуточные результаты относятся к примитивным типам и не требуют "глубокого" сравнения
    - не определено как распределяются аргументы функции-результата между функциями, производящими промежуточное кешируемое значение, в данном решении весь объём параметров передаётся каждой из таких функций
    - в качетсве пометки, что данная функция не требует перерасчета она должна возвращать true, если при вызове первым аргументом передан null, если требует, то в данном случае должна возвращать false
*/

const isEqaulArrays = (arrA, arrB, isEqualFn = (a, b) => a === b) => {
    if (arrA.length !== arrB.length) return false
    let equal = false
    for (const [index, value] of arrA.entries()) {
        equal = isEqualFn(value, arrB[index])
        if (!equal) return false
    }
    return true
}
const def = x => typeof x !== 'undefined'
const reverse = ([x, ...xs]) => def(x) ? [...reverse(xs), x] : []

function highOrdered(...fns) {
    let [summaryFn, ...processFns] = reverse(fns)
    processFns = reverse(processFns)
    const compareFunction = summaryFn(null)

    let interimResultsToCheck = []
    let cachedResults = null
    const ignoreList = processFns.map(fn => fn.apply(null, [null]))

    return function(...inputData) {
        const newInterimResults = processFns.map(fn => fn.apply(null, inputData))
        const newInterimResultsToCheck = newInterimResults.reduce((aggr, current, index) => {
            if (!ignoreList[index]) {
                aggr.push(current)
            }
            return aggr
        }, [])
        if ( !isEqaulArrays(interimResultsToCheck, newInterimResultsToCheck, compareFunction) ) {
            interimResultsToCheck = newInterimResultsToCheck
            cachedResults = summaryFn(...newInterimResults)
            console.log('recalculate')
        } else {
            console.log('use cached')
        }
        return cachedResults
    }
}


export default highOrdered
