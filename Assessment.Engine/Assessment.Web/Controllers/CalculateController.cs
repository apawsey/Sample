using System.Collections.Generic;
using Assessment.Engine;
using Assessment.Web.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Assessment.Web.Controllers
{
    [Route("api/[controller]")]
    public class CalculateController : Controller
    {
        // GET: api/<controller>
        [HttpPost("GetResult")]
        public IActionResult CalculateExpression(string expression)
        {
            return Ok(CalculationEngine.Calculate(expression));
        }

        [HttpPost("GetResults")]
        public IActionResult CalculateExpression([FromBody] IEnumerable<CalculationItem> calculationItems)
        {
            foreach (CalculationItem calculationItem in calculationItems)
            {
                calculationItem.Result = CalculationEngine.Calculate(calculationItem.Expression, true);
            }
            return Ok();
        }
    }
}
