const getHospitalIds = async (page) => {
    const researchTagTitle = await page.$(`[aria-label^="의료기관의 환자안전 및 직장"]`); // Element
    const researchTag = (await researchTagTitle.$x('..'))[0]; // Element Parent
    const mainNodes = await page.evaluateHandle(e => e.children[1], researchTag);
    const parentTitle = await page.evaluateHandle(e => e.children, mainNodes);
    const targetIds = await page.evaluate(el => {
        const targetIds = []
        el.forEach((eachDecision) => {
          eachDecision.children[1].children.forEach((eachLi) => {
            targetIds.push(eachLi.id)
          })
        })
        return targetIds
      }, parentTitle)
    return targetIds
}

exports.getHospitalIds = getHospitalIds 