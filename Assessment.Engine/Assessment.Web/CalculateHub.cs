using System.Collections.Generic;
using System.Threading.Tasks;
using Assessment.Engine;
using Assessment.Web.ViewModels;
using Microsoft.AspNetCore.SignalR;

namespace Assessment.Web
{
    public class CalculateHub : Hub
    {
        public string Connect()
        {
            return Context.ConnectionId;
        }

        public string CalculateSingle(string expression)
        {
            return CalculationEngine.Calculate(expression, true);
        }

        public IEnumerable<CalculationItem> CalculateMultiple(CalculationItem[] calculationItems)
        {
            foreach (CalculationItem calculationItem in calculationItems)
            {
                calculationItem.Result = CalculationEngine.Calculate(calculationItem.Expression, true);
            }

            return calculationItems;
        }

        public void Disconnect()
        {
            
        }
    }
}